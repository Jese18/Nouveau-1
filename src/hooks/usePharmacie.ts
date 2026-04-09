import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getMedicaments,
  addMedicament as addMedicamentApi,
  updateMedicamentStock,
  addAuditLog,
} from '@/lib/supabase';
import type { Medicament, PharmacieItem, Consultation } from '@/lib/index';

const STORAGE_KEY_CONSULTATIONS = 'made_consultations';

function getConsultationsFromStorage(): Consultation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CONSULTATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveConsultationsToStorage(consultations: Consultation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(consultations));
  } catch (error) {
    console.error('Erreur sauvegarde consultations:', error);
  }
}

export function usePharmacie() {
  const queryClient = useQueryClient();

  const medicamentsQuery = useQuery({
    queryKey: ['medicaments'],
    queryFn: async () => {
      const medicaments = await getMedicaments();
      const items: PharmacieItem[] = medicaments.map((med) => ({
        ...med,
        en_alerte: med.stock_actuel < med.seuil_alerte,
      }));

      const alertes = items.filter((item) => item.en_alerte);
      if (alertes.length > 0) {
        alertes.forEach((alerte) => {
          toast.warning(`Stock faible: ${alerte.nom}`, {
            description: `Stock actuel: ${alerte.stock_actuel} ${alerte.unite}. Seuil: ${alerte.seuil_alerte} ${alerte.unite}`,
          });
        });
      }

      return items;
    },
    refetchInterval: 60000,
  });

  const addMedicamentMutation = useMutation({
    mutationFn: async (data: Omit<Medicament, 'id' | 'created_at' | 'updated_at'>) => {
      const result = await addMedicamentApi(data);
      if (!result) throw new Error('Échec ajout médicament');
      return result;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['medicaments'] });
      await addAuditLog('Admin', `Ajout médicament: ${data.nom}`);
      toast.success('Médicament ajouté', {
        description: `${data.nom} a été ajouté à l'inventaire`,
      });
    },
    onError: (error) => {
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Échec ajout médicament',
      });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const result = await updateMedicamentStock(id, stock);
      if (!result) throw new Error('Échec mise à jour stock');
      return result;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['medicaments'] });
      await addAuditLog('Admin', `Mise à jour stock: ${data.nom} -> ${data.stock_actuel} ${data.unite}`);
      toast.success('Stock mis à jour', {
        description: `${data.nom}: ${data.stock_actuel} ${data.unite}`,
      });

      if (data.stock_actuel < data.seuil_alerte) {
        toast.warning('Alerte stock faible', {
          description: `${data.nom} est en dessous du seuil d'alerte`,
        });
      }
    },
    onError: (error) => {
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Échec mise à jour stock',
      });
    },
  });

  const consultationsQuery = useQuery({
    queryKey: ['consultations'],
    queryFn: () => getConsultationsFromStorage(),
  });

  const addConsultationMutation = useMutation({
    mutationFn: async (data: Omit<Consultation, 'id' | 'created_at'>) => {
      const consultation: Consultation = {
        id: crypto.randomUUID(),
        ...data,
        created_at: new Date().toISOString(),
      };

      const consultations = getConsultationsFromStorage();
      saveConsultationsToStorage([consultation, ...consultations]);

      if (data.medicaments_prescrits && data.medicaments_prescrits.length > 0) {
        const medicaments = await getMedicaments();
        for (const medId of data.medicaments_prescrits) {
          const med = medicaments.find((m) => m.id === medId);
          if (med && med.stock_actuel > 0) {
            await updateMedicamentStock(medId, med.stock_actuel - 1);
          }
        }
      }

      return consultation;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['consultations'] });
      await queryClient.invalidateQueries({ queryKey: ['medicaments'] });
      await addAuditLog('Admin', `Nouvelle consultation: ${data.diagnostic}`);
      toast.success('Consultation enregistrée', {
        description: 'La consultation a été ajoutée avec succès',
      });
    },
    onError: (error) => {
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Échec enregistrement consultation',
      });
    },
  });

  const getConsultationsByMembre = (membreId: string): Consultation[] => {
    const consultations = consultationsQuery.data || [];
    return consultations.filter((c) => c.membre_id === membreId);
  };

  const getAlertesPharmacie = (): PharmacieItem[] => {
    const medicaments = medicamentsQuery.data || [];
    return medicaments.filter((m) => m.en_alerte);
  };

  const getStatistiquesPharmacie = () => {
    const medicaments = medicamentsQuery.data || [];
    const consultations = consultationsQuery.data || [];

    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const consultationsMois = consultations.filter((c) => c.created_at >= debutMois);

    return {
      total_medicaments: medicaments.length,
      medicaments_en_alerte: medicaments.filter((m) => m.en_alerte).length,
      consultations_mois: consultationsMois.length,
      stock_total_valeur: medicaments.reduce((sum, m) => sum + m.stock_actuel, 0),
    };
  };

  return {
    medicaments: medicamentsQuery.data || [],
    isLoadingMedicaments: medicamentsQuery.isLoading,
    consultations: consultationsQuery.data || [],
    isLoadingConsultations: consultationsQuery.isLoading,
    addMedicament: addMedicamentMutation.mutate,
    isAddingMedicament: addMedicamentMutation.isPending,
    updateStock: updateStockMutation.mutate,
    isUpdatingStock: updateStockMutation.isPending,
    addConsultation: addConsultationMutation.mutate,
    isAddingConsultation: addConsultationMutation.isPending,
    getConsultationsByMembre,
    getAlertesPharmacie,
    getStatistiquesPharmacie,
  };
}
