import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, User, Pill, Download, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { usePharmacie } from '@/hooks/usePharmacie';
import { useMembers } from '@/hooks/useMembers';
import type { Consultation } from '@/lib/index';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CabinetMedical() {
  const { consultations, medicaments, addConsultation, isAddingConsultation, getStatistiquesPharmacie } = usePharmacie();
  const { membres } = useMembers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMembre, setFilterMembre] = useState<string>('all');
  const [formData, setFormData] = useState({
    membre_id: '',
    date_consultation: new Date().toISOString().split('T')[0],
    diagnostic: '',
    traitement: '',
    medicaments_prescrits: [] as string[],
    notes: '',
  });

  const stats = getStatistiquesPharmacie();

  const filteredConsultations = consultations.filter((consultation) => {
    const membre = membres.find((m) => m.id === consultation.membre_id);
    const membreNom = membre ? `${membre.prenom} ${membre.nom}`.toLowerCase() : '';
    const matchesSearch = membreNom.includes(searchTerm.toLowerCase()) || consultation.diagnostic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMembre === 'all' || consultation.membre_id === filterMembre;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.membre_id || !formData.diagnostic || !formData.traitement) {
      toast.error('Erreur', { description: 'Veuillez remplir tous les champs obligatoires' });
      return;
    }

    addConsultation(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          membre_id: '',
          date_consultation: new Date().toISOString().split('T')[0],
          diagnostic: '',
          traitement: '',
          medicaments_prescrits: [],
          notes: '',
        });
      },
    });
  };

  const handleMedicamentToggle = (medId: string) => {
    setFormData((prev) => ({
      ...prev,
      medicaments_prescrits: prev.medicaments_prescrits.includes(medId)
        ? prev.medicaments_prescrits.filter((id) => id !== medId)
        : [...prev.medicaments_prescrits, medId],
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 102, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MADE ONG', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Historique des Consultations Médicales', 105, 32, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 50);
    doc.text(`Total consultations: ${filteredConsultations.length}`, 14, 56);
    
    const tableData = filteredConsultations.map((consultation) => {
      const membre = membres.find((m) => m.id === consultation.membre_id);
      const membreNom = membre ? `${membre.prenom} ${membre.nom}` : 'Inconnu';
      const date = new Date(consultation.date_consultation).toLocaleDateString('fr-FR');
      return [date, membreNom, consultation.diagnostic, consultation.traitement];
    });
    
    (doc as any).autoTable({
      startY: 65,
      head: [['Date', 'Membre', 'Diagnostic', 'Traitement']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 102, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 65 },
    });
    
    doc.save(`consultations_medicales_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Export réussi', { description: 'Le PDF a été téléchargé' });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Cabinet Médical</h1>
          <p className="text-muted-foreground">Gestion des consultations et suivi médical</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{consultations.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ce Mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-2">{stats.consultations_mois}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Médicaments Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-3">{stats.total_medicaments}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Alertes Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.medicaments_en_alerte}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">Historique des Consultations</CardTitle>
                <CardDescription>Liste complète des consultations médicales</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportToPDF} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exporter PDF
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4" />
                      Nouvelle Consultation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Nouvelle Consultation Médicale</DialogTitle>
                      <DialogDescription>Enregistrer une nouvelle consultation</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="membre">Membre *</Label>
                        <Select value={formData.membre_id} onValueChange={(value) => setFormData({ ...formData, membre_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un membre" />
                          </SelectTrigger>
                          <SelectContent>
                            {membres.map((membre) => (
                              <SelectItem key={membre.id} value={membre.id}>
                                {membre.prenom} {membre.nom} ({membre.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date de Consultation *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date_consultation}
                          onChange={(e) => setFormData({ ...formData, date_consultation: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="diagnostic">Diagnostic *</Label>
                        <Textarea
                          id="diagnostic"
                          value={formData.diagnostic}
                          onChange={(e) => setFormData({ ...formData, diagnostic: e.target.value })}
                          placeholder="Décrire le diagnostic"
                          required
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="traitement">Traitement Prescrit *</Label>
                        <Textarea
                          id="traitement"
                          value={formData.traitement}
                          onChange={(e) => setFormData({ ...formData, traitement: e.target.value })}
                          placeholder="Décrire le traitement"
                          required
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Médicaments Prescrits</Label>
                        <div className="border border-border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                          {medicaments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Aucun médicament disponible</p>
                          ) : (
                            medicaments.map((med) => (
                              <div key={med.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`med-${med.id}`}
                                  checked={formData.medicaments_prescrits.includes(med.id)}
                                  onChange={() => handleMedicamentToggle(med.id)}
                                  className="h-4 w-4 rounded border-border"
                                />
                                <label htmlFor={`med-${med.id}`} className="text-sm flex-1 cursor-pointer">
                                  {med.nom} ({med.stock_actuel} {med.unite})
                                </label>
                                {med.stock_actuel < med.seuil_alerte && (
                                  <Badge variant="destructive" className="text-xs">Stock faible</Badge>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes Complémentaires</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Notes additionnelles (optionnel)"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button type="submit" disabled={isAddingConsultation} className="bg-primary hover:bg-primary/90">
                          {isAddingConsultation ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par membre ou diagnostic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select value={filterMembre} onValueChange={setFilterMembre}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrer par membre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les membres</SelectItem>
                    {membres.map((membre) => (
                      <SelectItem key={membre.id} value={membre.id}>
                        {membre.prenom} {membre.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredConsultations.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune consultation trouvée</p>
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Membre</TableHead>
                      <TableHead className="font-semibold">Diagnostic</TableHead>
                      <TableHead className="font-semibold">Traitement</TableHead>
                      <TableHead className="font-semibold">Médicaments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConsultations.map((consultation) => {
                      const membre = membres.find((m) => m.id === consultation.membre_id);
                      const membreNom = membre ? `${membre.prenom} ${membre.nom}` : 'Inconnu';
                      const medicamentsPrescrits = consultation.medicaments_prescrits
                        ? consultation.medicaments_prescrits
                            .map((medId) => medicaments.find((m) => m.id === medId)?.nom)
                            .filter(Boolean)
                        : [];

                      return (
                        <TableRow key={consultation.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{membreNom}</div>
                                {membre && <div className="text-xs text-muted-foreground">{membre.role}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="line-clamp-2">{consultation.diagnostic}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="line-clamp-2">{consultation.traitement}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {medicamentsPrescrits.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {medicamentsPrescrits.map((nom, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    <Pill className="h-3 w-3 mr-1" />
                                    {nom}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Aucun</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
