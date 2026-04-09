import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertTriangle, TrendingUp, Package, Download, History, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { usePharmacie } from '@/hooks/usePharmacie';
import { exportPharmacieToExcel } from '@/lib/excel-generator';
import type { Medicament } from '@/lib/index';

export function PharmacieInventory() {
  const {
    medicaments,
    isLoadingMedicaments,
    addMedicament,
    isAddingMedicament,
    updateStock,
    isUpdatingStock,
    getAlertesPharmacie,
    getStatistiquesPharmacie,
  } = usePharmacie();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    stock_actuel: 0,
    seuil_alerte: 0,
    unite: '',
    description: '',
  });

  const [stockAjout, setStockAjout] = useState(0);

  const stats = getStatistiquesPharmacie();
  const alertes = getAlertesPharmacie();

  const filteredMedicaments = medicaments.filter((med) =>
    med.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMedicament = () => {
    if (!formData.nom || !formData.unite || formData.stock_actuel < 0 || formData.seuil_alerte < 0) {
      toast.error('Erreur', {
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }

    addMedicament(formData, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        setFormData({
          nom: '',
          stock_actuel: 0,
          seuil_alerte: 0,
          unite: '',
          description: '',
        });
      },
    });
  };

  const handleUpdateStock = () => {
    if (!selectedMedicament || stockAjout <= 0) {
      toast.error('Erreur', {
        description: 'Veuillez entrer une quantité valide',
      });
      return;
    }

    const nouveauStock = selectedMedicament.stock_actuel + stockAjout;
    updateStock(
      { id: selectedMedicament.id, stock: nouveauStock },
      {
        onSuccess: () => {
          setIsStockDialogOpen(false);
          setSelectedMedicament(null);
          setStockAjout(0);
        },
      }
    );
  };

  const handleExportExcel = () => {
    exportPharmacieToExcel(medicaments);
    toast.success('Export réussi', {
      description: 'L\'inventaire a été exporté en Excel',
    });
  };

  const openStockDialog = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
    setStockAjout(0);
    setIsStockDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Médicaments</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_medicaments}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.medicaments_en_alerte}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultations (Mois)</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.consultations_mois}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stock_total_valeur}</div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {alertes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-destructive/10 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                Alertes Stock Faible
              </CardTitle>
              <CardDescription>
                {alertes.length} médicament(s) en dessous du seuil d'alerte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alertes.map((alerte) => (
                  <div
                    key={alerte.id}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-destructive/30"
                  >
                    <div>
                      <p className="font-medium">{alerte.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {alerte.stock_actuel} {alerte.unite} / Seuil: {alerte.seuil_alerte}{' '}
                        {alerte.unite}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openStockDialog(alerte)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter Stock
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventaire Pharmacie</CardTitle>
                <CardDescription>Gestion des médicaments et stocks</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                  disabled={medicaments.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter Excel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Médicament
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Rechercher un médicament..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {isLoadingMedicaments ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredMedicaments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'Aucun médicament trouvé' : 'Aucun médicament dans l\'inventaire'}
              </div>
            ) : (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nom</TableHead>
                      <TableHead className="text-center">Stock Actuel</TableHead>
                      <TableHead className="text-center">Seuil Alerte</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredMedicaments.map((medicament, index) => (
                        <motion.tr
                          key={medicament.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{medicament.nom}</p>
                              {medicament.description && (
                                <p className="text-sm text-muted-foreground">
                                  {medicament.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">
                              {medicament.stock_actuel} {medicament.unite}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-muted-foreground">
                              {medicament.seuil_alerte} {medicament.unite}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {medicament.en_alerte ? (
                              <Badge
                                variant="destructive"
                                className="animate-pulse bg-destructive text-destructive-foreground"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Stock Faible
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-green-500/10 text-green-600 border-green-500/30"
                              >
                                OK
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStockDialog(medicament)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter Stock
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur border-border/50">
          <DialogHeader>
            <DialogTitle>Ajouter un Médicament</DialogTitle>
            <DialogDescription>
              Remplissez les informations du nouveau médicament
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du médicament *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Paracétamol"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock initial *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock_actuel}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_actuel: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unite">Unité *</Label>
                <Input
                  id="unite"
                  value={formData.unite}
                  onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                  placeholder="Ex: comprimés, ml"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seuil">Seuil d'alerte *</Label>
              <Input
                id="seuil"
                type="number"
                min="0"
                value={formData.seuil_alerte}
                onChange={(e) =>
                  setFormData({ ...formData, seuil_alerte: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Informations complémentaires..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddMedicament}
              disabled={isAddingMedicament}
              className="bg-primary hover:bg-primary/90"
            >
              {isAddingMedicament ? 'Ajout...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur border-border/50">
          <DialogHeader>
            <DialogTitle>Ajouter du Stock</DialogTitle>
            <DialogDescription>
              {selectedMedicament?.nom}
              <br />
              Stock actuel: {selectedMedicament?.stock_actuel} {selectedMedicament?.unite}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ajout">Quantité à ajouter</Label>
              <Input
                id="ajout"
                type="number"
                min="1"
                value={stockAjout}
                onChange={(e) => setStockAjout(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            {stockAjout > 0 && selectedMedicament && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Nouveau stock:</p>
                <p className="text-lg font-semibold">
                  {selectedMedicament.stock_actuel + stockAjout} {selectedMedicament.unite}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleUpdateStock}
              disabled={isUpdatingStock || stockAjout <= 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isUpdatingStock ? 'Mise à jour...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
