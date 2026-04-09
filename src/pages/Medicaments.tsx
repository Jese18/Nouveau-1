import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Package, AlertTriangle, Activity } from 'lucide-react';
import { PharmacieInventory } from '@/components/PharmacieInventory';
import { usePharmacie } from '@/hooks/usePharmacie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { exportPharmacieToExcel } from '@/lib/excel-generator';
import { toast } from 'sonner';

const medicamentSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  stock_actuel: z.number().min(0, 'Stock doit être positif'),
  seuil_alerte: z.number().min(0, 'Seuil doit être positif'),
  unite: z.string().min(1, 'Unité requise'),
  description: z.string().optional(),
});

type MedicamentFormData = z.infer<typeof medicamentSchema>;

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 35 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Medicaments() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addMedicament, isAddingMedicament, medicaments, getStatistiquesPharmacie } = usePharmacie();
  const stats = getStatistiquesPharmacie();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicamentFormData>({
    resolver: zodResolver(medicamentSchema),
    defaultValues: {
      unite: 'comprimés',
    },
  });

  const onSubmit = (data: MedicamentFormData) => {
    addMedicament({
      nom: data.nom || '',
      stock_actuel: data.stock_actuel || 0,
      seuil_alerte: data.seuil_alerte || 0,
      unite: data.unite || 'unité',
      description: data.description,
    }, {
      onSuccess: () => {
        reset();
        setDialogOpen(false);
      },
    });
  };

  const handleExport = () => {
    try {
      exportPharmacieToExcel(medicaments);
      toast.success('Export réussi', {
        description: 'L\'inventaire a été exporté en Excel',
      });
    } catch (error) {
      toast.error('Erreur d\'export', {
        description: error instanceof Error ? error.message : 'Échec de l\'export',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="max-w-7xl mx-auto space-y-8"
      >
        <motion.div variants={fadeInUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Pharmacie</h1>
            <p className="text-muted-foreground">Gestion de l'inventaire et des médicaments</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter Excel
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  Ajouter médicament
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Nouveau médicament</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Ajouter un nouveau médicament à l'inventaire
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom" className="text-foreground">Nom du médicament</Label>
                    <Input
                      id="nom"
                      {...register('nom')}
                      placeholder="Ex: Paracétamol"
                      className="bg-background border-border text-foreground"
                    />
                    {errors.nom && (
                      <p className="text-sm text-destructive">{errors.nom.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock_actuel" className="text-foreground">Stock actuel</Label>
                      <Input
                        id="stock_actuel"
                        type="number"
                        {...register('stock_actuel', { valueAsNumber: true })}
                        placeholder="0"
                        className="bg-background border-border text-foreground"
                      />
                      {errors.stock_actuel && (
                        <p className="text-sm text-destructive">{errors.stock_actuel.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seuil_alerte" className="text-foreground">Seuil d'alerte</Label>
                      <Input
                        id="seuil_alerte"
                        type="number"
                        {...register('seuil_alerte', { valueAsNumber: true })}
                        placeholder="10"
                        className="bg-background border-border text-foreground"
                      />
                      {errors.seuil_alerte && (
                        <p className="text-sm text-destructive">{errors.seuil_alerte.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unite" className="text-foreground">Unité</Label>
                    <Input
                      id="unite"
                      {...register('unite')}
                      placeholder="comprimés, ml, boîtes..."
                      className="bg-background border-border text-foreground"
                    />
                    {errors.unite && (
                      <p className="text-sm text-destructive">{errors.unite.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground">Description (optionnel)</Label>
                    <Input
                      id="description"
                      {...register('description')}
                      placeholder="Informations complémentaires"
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset();
                        setDialogOpen(false);
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isAddingMedicament}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {isAddingMedicament ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total médicaments
              </CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total_medicaments}</div>
              <p className="text-xs text-muted-foreground mt-1">Dans l'inventaire</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alertes stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {stats.medicaments_en_alerte}
              </div>
              <p className="text-xs text-muted-foreground mt-1">En dessous du seuil</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consultations ce mois
              </CardTitle>
              <Activity className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.consultations_mois}</div>
              <p className="text-xs text-muted-foreground mt-1">Depuis le début du mois</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stock total
              </CardTitle>
              <Package className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.stock_total_valeur}</div>
              <p className="text-xs text-muted-foreground mt-1">Unités en stock</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground">Inventaire</CardTitle>
              <CardDescription className="text-muted-foreground">
                Liste complète des médicaments avec alertes de stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PharmacieInventory />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
