import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMembers,
  getMemberById,
  getMemberByBarcode,
  addMembre,
  updateMembre,
  deleteMembre,
  syncOfflineData,
} from '@/lib/supabase';
import type { Membre, MembreFormData, Role } from '@/lib/index';
import { useEffect } from 'react';

const QUERY_KEY = 'membres';

export function useMembers(role?: Role) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      syncOfflineData().then(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queryClient]);

  const membresQuery = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getMembers,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const filteredMembres = role
    ? (membresQuery.data || []).filter((m) => m.role === role)
    : membresQuery.data || [];

  const addMembreMutation = useMutation({
    mutationFn: (data: MembreFormData & { code_barre: string }) => addMembre(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const updateMembreMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MembreFormData> }) => updateMembre(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const deleteMembreMutation = useMutation({
    mutationFn: (id: string) => deleteMembre(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    membres: filteredMembres,
    isLoading: membresQuery.isLoading,
    isError: membresQuery.isError,
    error: membresQuery.error,
    refetch: membresQuery.refetch,
    addMembre: addMembreMutation.mutate,
    addMembreAsync: addMembreMutation.mutateAsync,
    isAddingMembre: addMembreMutation.isPending,
    updateMembre: updateMembreMutation.mutate,
    updateMembreAsync: updateMembreMutation.mutateAsync,
    isUpdatingMembre: updateMembreMutation.isPending,
    deleteMembre: deleteMembreMutation.mutate,
    deleteMembreAsync: deleteMembreMutation.mutateAsync,
    isDeletingMembre: deleteMembreMutation.isPending,
    getMemberByIdAsync: getMemberById,
    getMemberByBarcodeAsync: getMemberByBarcode,
  };
}