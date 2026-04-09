import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Filter, Clock, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { generatePresenceListPDF, generateRapportPointagePDF, generateInventairePharmaciePDF } from "@/lib/pdf-generator";
import { Rapport, RAPPORT_AUTO_HEURE } from "@/lib/index";

type TypeRapport = "Présence" | "Pharmacie" | "Événements" | "Général";
type StatutRapport = "Généré" | "En cours" | "Erreur";

interface RapportItem extends Rapport {
  statut: StatutRapport;
  taille?: string;
}

const MOCK_RAPPORTS: RapportItem[] = [
  {
    id: "1",
    type: "Présence",
    titre: "Rapport de présence quotidien",
    date_generation: "2026-04-08T18:00:00",
    periode_debut: "2026-04-08",
    periode_fin: "2026-04-08",
    statut: "Généré",
    taille: "245 KB",
    created_at: "2026-04-08T18:00:00",
  },
  {
    id: "2",
    type: "Pharmacie",
    titre: "Inventaire pharmacie mensuel",
    date_generation: "2026-04-07T18:00:00",
    periode_debut: "2026-03-01",
    periode_fin: "2026-03-31",
    statut: "Généré",
    taille: "189 KB",
    created_at: "2026-04-07T18:00:00",
  },
  {
    id: "3",
    type: "Événements",
    titre: "Rapport événements hebdomadaire",
    date_generation: "2026-04-06T18:00:00",
    periode_debut: "2026-03-31",
    periode_fin: "2026-04-06",
    statut: "Généré",
    taille: "312 KB",
    created_at: "2026-04-06T18:00:00",
  },
  {
    id: "4",
    type: "Général",
    titre: "Rapport général mensuel",
    date_generation: "2026-04-01T18:00:00",
    periode_debut: "2026-03-01",
    periode_fin: "2026-03-31",
    statut: "Généré",
    taille: "567 KB",
    created_at: "2026-04-01T18:00:00",
  },
  {
    id: "5",
    type: "Présence",
    titre: "Rapport de présence quotidien",
    date_generation: "2026-04-07T18:00:00",
    periode_debut: "2026-04-07",
    periode_fin: "2026-04-07",
    statut: "Généré",
    taille: "238 KB",
    created_at: "2026-04-07T18:00:00",
  },
];

const TYPE_COLORS: Record<TypeRapport, string> = {
  Présence: "bg-primary/10 text-primary border-primary/20",
  Pharmacie: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Événements: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Général: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

const STATUT_COLORS: Record<StatutRapport, string> = {
  Généré: "bg-chart-2/10 text-chart-2",
  "En cours": "bg-chart-4/10 text-chart-4",
  Erreur: "bg-destructive/10 text-destructive",
};

export default function Rapports() {
  const [rapports, setRapports] = useState<RapportItem[]>(MOCK_RAPPORTS);
  const [filteredRapports, setFilteredRapports] = useState<RapportItem[]>(MOCK_RAPPORTS);
  const [typeFilter, setTypeFilter] = useState<string>("tous");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autoGeneration, setAutoGeneration] = useState(true);
  const [heureGeneration, setHeureGeneration] = useState(RAPPORT_AUTO_HEURE.toString());

  useEffect(() => {
    let filtered = [...rapports];

    if (typeFilter !== "tous") {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter((r) =>
        r.date_generation.startsWith(dateFilter)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.titre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.date_generation).getTime() -
        new Date(a.date_generation).getTime()
    );

    setFilteredRapports(filtered);
  }, [rapports, typeFilter, dateFilter, searchQuery]);

  const handleDownload = (rapport: RapportItem) => {
    toast.success(`Téléchargement de "${rapport.titre}"`);
  };

  const handleGenerateManual = (type: TypeRapport) => {
    const newRapport: RapportItem = {
      id: Date.now().toString(),
      type,
      titre: `Rapport ${type.toLowerCase()} manuel`,
      date_generation: new Date().toISOString(),
      periode_debut: new Date().toISOString().split("T")[0],
      periode_fin: new Date().toISOString().split("T")[0],
      statut: "En cours",
      created_at: new Date().toISOString(),
    };

    setRapports((prev) => [newRapport, ...prev]);

    setTimeout(() => {
      setRapports((prev) =>
        prev.map((r) =>
          r.id === newRapport.id
            ? { ...r, statut: "Généré" as StatutRapport, taille: "156 KB" }
            : r
        )
      );
      toast.success(`Rapport ${type} généré avec succès`);
    }, 2000);
  };

  const handleSaveConfig = () => {
    toast.success("Configuration des rapports automatiques enregistrée");
  };

  const stats = {
    total: rapports.length,
    aujourdhui: rapports.filter((r) =>
      r.date_generation.startsWith(new Date().toISOString().split("T")[0])
    ).length,
    semaine: rapports.filter((r) => {
      const date = new Date(r.date_generation);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length,
    erreurs: rapports.filter((r) => r.statut === "Erreur").length,
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Rapports Automatiques</h1>
            <p className="text-muted-foreground mt-2">
              Rapports générés automatiquement à {RAPPORT_AUTO_HEURE}h chaque jour
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Configuration des Rapports Automatiques</DialogTitle>
                <DialogDescription>
                  Configurez la génération automatique des rapports quotidiens
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Génération automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer la génération quotidienne
                    </p>
                  </div>
                  <Switch
                    checked={autoGeneration}
                    onCheckedChange={setAutoGeneration}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heure">Heure de génération</Label>
                  <Select value={heureGeneration} onValueChange={setHeureGeneration}>
                    <SelectTrigger id="heure">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Types de rapports</Label>
                  <div className="space-y-2">
                    {["Présence", "Pharmacie", "Événements", "Général"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label className="font-normal">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSaveConfig} className="w-full">
                  Enregistrer la configuration
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rapports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tous les rapports générés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aujourdhui}</div>
            <p className="text-xs text-muted-foreground">Rapports du jour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette Semaine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.semaine}</div>
            <p className="text-xs text-muted-foreground">7 derniers jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.erreurs}</div>
            <p className="text-xs text-muted-foreground">Rapports en erreur</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs defaultValue="liste" className="space-y-6">
          <TabsList>
            <TabsTrigger value="liste">Liste des Rapports</TabsTrigger>
            <TabsTrigger value="generation">Génération Manuelle</TabsTrigger>
          </TabsList>

          <TabsContent value="liste" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtres</CardTitle>
                <CardDescription>
                  Filtrez les rapports par type, date ou recherche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="type-filter">Type de rapport</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger id="type-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tous">Tous les types</SelectItem>
                        <SelectItem value="Présence">Présence</SelectItem>
                        <SelectItem value="Pharmacie">Pharmacie</SelectItem>
                        <SelectItem value="Événements">Événements</SelectItem>
                        <SelectItem value="Général">Général</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-filter">Date</Label>
                    <Input
                      id="date-filter"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search">Recherche</Label>
                    <Input
                      id="search"
                      placeholder="Rechercher un rapport..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredRapports.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun rapport trouvé</p>
                  </CardContent>
                </Card>
              ) : (
                filteredRapports.map((rapport, index) => (
                  <motion.div
                    key={rapport.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold text-lg">{rapport.titre}</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={TYPE_COLORS[rapport.type]}>
                                {rapport.type}
                              </Badge>
                              <Badge variant="outline" className={STATUT_COLORS[rapport.statut]}>
                                {rapport.statut}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <p className="font-medium text-foreground">Date génération</p>
                                <p>
                                  {new Date(rapport.date_generation).toLocaleDateString("fr-FR")}
                                </p>
                                <p>
                                  {new Date(rapport.date_generation).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Période</p>
                                <p>
                                  {new Date(rapport.periode_debut).toLocaleDateString("fr-FR")}
                                </p>
                                <p>
                                  {new Date(rapport.periode_fin).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                              {rapport.taille && (
                                <div>
                                  <p className="font-medium text-foreground">Taille</p>
                                  <p>{rapport.taille}</p>
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-foreground">Statut</p>
                                <div className="flex items-center gap-1">
                                  {rapport.statut === "Généré" && (
                                    <CheckCircle className="h-4 w-4 text-chart-2" />
                                  )}
                                  {rapport.statut === "Erreur" && (
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                  )}
                                  <span>{rapport.statut}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDownload(rapport)}
                            disabled={rapport.statut !== "Généré"}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Télécharger
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="generation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Générer un Rapport Manuellement</CardTitle>
                <CardDescription>
                  Créez un rapport à la demande pour un type spécifique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Rapport de Présence
                      </CardTitle>
                      <CardDescription>
                        Liste complète des présences et absences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleGenerateManual("Présence")}
                        className="w-full"
                      >
                        Générer le rapport
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-chart-2 transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-chart-2" />
                        Rapport Pharmacie
                      </CardTitle>
                      <CardDescription>
                        Inventaire et alertes de stock
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleGenerateManual("Pharmacie")}
                        className="w-full"
                      >
                        Générer le rapport
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-chart-3 transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-chart-3" />
                        Rapport Événements
                      </CardTitle>
                      <CardDescription>
                        Récapitulatif des événements et activités
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleGenerateManual("Événements")}
                        className="w-full"
                      >
                        Générer le rapport
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-chart-4 transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-chart-4" />
                        Rapport Général
                      </CardTitle>
                      <CardDescription>
                        Vue d'ensemble complète de l'activité
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleGenerateManual("Général")}
                        className="w-full"
                      >
                        Générer le rapport
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
