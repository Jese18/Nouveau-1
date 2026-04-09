import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Upload, X, User, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useMembers } from '@/hooks/useMembers';
import { generateUniqueBarcodeId, generateBarcode } from '@/lib/barcode';
import type { Membre, MembreFormData, Role } from '@/lib/index';
import { ROLES } from '@/lib/index';
import { useToast } from '@/hooks/use-toast';

interface MembreFormProps {
  membre?: Membre;
  onSuccess: () => void;
  onCancel: () => void;
}

const membreSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  role: z.enum(['Personnel', 'Mère', 'Enfant', 'Bénéficiaire'] as const),
  photo: z.string().optional(),
  date_inscription: z.string().min(1, 'La date d\'inscription est requise'),
  status_sante_sociale: z.string().optional(),
  famille_id: z.string().optional(),
});

type MembreFormValues = z.infer<typeof membreSchema>;

export function MembreForm({ membre, onSuccess, onCancel }: MembreFormProps) {
  const { addMembre, updateMembre, isAddingMembre, isUpdatingMembre } = useMembers();
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(membre?.photo);
  const [barcodePreview, setBarcodePreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MembreFormValues>({
    resolver: zodResolver(membreSchema),
    defaultValues: {
      nom: membre?.nom || '',
      prenom: membre?.prenom || '',
      role: membre?.role || 'Personnel',
      photo: membre?.photo || '',
      date_inscription: membre?.date_inscription || new Date().toISOString().split('T')[0],
      status_sante_sociale: membre?.status_sante_sociale || '',
      famille_id: membre?.famille_id || '',
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (!membre) {
      const uniqueCode = generateUniqueBarcodeId();
      const barcodeImage = generateBarcode(uniqueCode);
      setBarcodePreview(barcodeImage);
    } else if (membre.code_barre) {
      const barcodeImage = generateBarcode(membre.code_barre);
      setBarcodePreview(barcodeImage);
    }
  }, [membre]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erreur',
          description: 'La photo ne doit pas dépasser 5 MB',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setValue('photo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(undefined);
    setValue('photo', '');
  };

  const onSubmit = async (data: MembreFormValues) => {
    try {
      if (membre) {
        await updateMembre(
          {
            id: membre.id,
            data: {
              nom: data.nom,
              prenom: data.prenom,
              role: data.role,
              photo: data.photo,
              date_inscription: data.date_inscription,
              status_sante_sociale: data.status_sante_sociale,
              famille_id: data.famille_id,
            },
          },
          {
            onSuccess: () => {
              toast({
                title: 'Succès',
                description: 'Membre modifié avec succès',
              });
              onSuccess();
            },
            onError: (error) => {
              toast({
                title: 'Erreur',
                description: `Échec de la modification: ${error.message}`,
                variant: 'destructive',
              });
            },
          }
        );
      } else {
        const uniqueCode = generateUniqueBarcodeId();
        await addMembre(
          {
            nom: data.nom,
            prenom: data.prenom,
            role: data.role,
            photo: data.photo,
            date_inscription: data.date_inscription,
            status_sante_sociale: data.status_sante_sociale,
            famille_id: data.famille_id,
            code_barre: uniqueCode,
          },
          {
            onSuccess: () => {
              toast({
                title: 'Succès',
                description: 'Membre ajouté avec succès',
              });
              onSuccess();
            },
            onError: (error) => {
              toast({
                title: 'Erreur',
                description: `Échec de l'ajout: ${error.message}`,
                variant: 'destructive',
              });
            },
          }
        );
      }
    } catch (error) {
      console.error('Erreur formulaire membre:', error);
    }
  };

  const isSubmitting = isAddingMembre || isUpdatingMembre;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto"
    >
      <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Nom *
              </Label>
              <Input
                id="nom"
                {...register('nom')}
                placeholder="Nom de famille"
                className="bg-background/50"
              />
              {errors.nom && (
                <p className="text-sm text-destructive">{errors.nom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenom" className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Prénom *
              </Label>
              <Input
                id="prenom"
                {...register('prenom')}
                placeholder="Prénom"
                className="bg-background/50"
              />
              {errors.prenom && (
                <p className="text-sm text-destructive">{errors.prenom.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue('role', value as Role)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_inscription" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Date d'inscription *
              </Label>
              <Input
                id="date_inscription"
                type="date"
                {...register('date_inscription')}
                className="bg-background/50"
              />
              {errors.date_inscription && (
                <p className="text-sm text-destructive">{errors.date_inscription.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <div className="flex items-start gap-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Aperçu"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-primary/20"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                    onClick={removePhoto}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/20">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Format: JPG, PNG. Taille max: 5 MB
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_sante_sociale" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Statut santé/sociale
            </Label>
            <Textarea
              id="status_sante_sociale"
              {...register('status_sante_sociale')}
              placeholder="Informations sur la santé et la situation sociale..."
              rows={4}
              className="bg-background/50 resize-none"
            />
          </div>

          {barcodePreview && (
            <div className="space-y-2">
              <Label>Code-barres généré</Label>
              <div className="p-4 bg-white rounded-lg border-2 border-primary/20 flex justify-center">
                <img src={barcodePreview} alt="Code-barres" className="h-20" />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {membre ? 'Modification...' : 'Enregistrement...'}
                </span>
              ) : (
                <span>{membre ? 'Modifier' : 'Enregistrer'}</span>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
