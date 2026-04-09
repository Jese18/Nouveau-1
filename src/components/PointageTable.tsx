import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePointages } from '@/hooks/usePointages';
import { exportPointageToExcel } from '@/lib/excel-generator';
import { generateRapportPointagePDF } from '@/lib/pdf-generator';
import type { PointageRecord, MethodePointage, TypePointage } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export function PointageTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypePointage | 'all'>('all');
  const [methodeFilter, setMethodeFilter] = useState<MethodePointage | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'date' | 'nom'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { pointages, isLoading } = usePointages({
    date_debut: dateDebut || undefined,
    date_fin: dateFin || undefined,
  });

  const filteredPointages = useMemo(() => {
    let filtered = [...pointages];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.membre?.nom.toLowerCase().includes(term) ||
          p.membre?.prenom.toLowerCase().includes(term) ||
          p.membre?.code_barre.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    if (methodeFilter !== 'all') {
      filtered = filtered.filter((p) => p.methode === methodeFilter);
    }

    filtered.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date_heure).getTime();
        const dateB = new Date(b.date_heure).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const nomA = `${a.membre?.nom || ''} ${a.membre?.prenom || ''}`.toLowerCase();
        const nomB = `${b.membre?.nom || ''} ${b.membre?.prenom || ''}`.toLowerCase();
        return sortOrder === 'asc'
          ? nomA.localeCompare(nomB)
          : nomB.localeCompare(nomA);
      }
    });

    return filtered;
  }, [pointages, searchTerm, typeFilter, methodeFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredPointages.length / ITEMS_PER_PAGE);
  const paginatedPointages = filteredPointages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExportExcel = () => {
    try {
      exportPointageToExcel(filteredPointages, dateDebut, dateFin);
      toast.success('Export Excel réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel');
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    try {
      const debut = dateDebut || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const fin = dateFin || new Date().toISOString().split('T')[0];
      generateRapportPointagePDF(filteredPointages, debut, fin);
      toast.success('Export PDF réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF');
      console.error(error);
    }
  };

  const handleSort = (field: 'date' | 'nom') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateDebut('');
    setDateFin('');
    setTypeFilter('all');
    setMethodeFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, prénom ou code-barres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportExcel}
                variant="outline"
                className="gap-2"
                disabled={filteredPointages.length === 0}
              >
                <Download className="h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="gap-2"
                disabled={filteredPointages.length === 0}
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date début</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date fin</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypePointage | 'all')}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Entrée">Entrée</SelectItem>
                  <SelectItem value="Sortie">Sortie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Méthode</label>
              <Select value={methodeFilter} onValueChange={(v) => setMethodeFilter(v as MethodePointage | 'all')}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="Laser">Laser</SelectItem>
                  <SelectItem value="Manuel">Manuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={resetFilters}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Filter className="h-4 w-4" />
              Réinitialiser les filtres
            </Button>
            <p className="text-sm text-muted-foreground">
              {filteredPointages.length} pointage{filteredPointages.length > 1 ? 's' : ''} trouvé{filteredPointages.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : filteredPointages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-medium text-muted-foreground">Aucun pointage trouvé</p>
            <p className="text-sm text-muted-foreground mt-2">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead
                      className="cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        Date/Heure
                        {sortField === 'date' && (
                          <span className="text-primary">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort('nom')}
                    >
                      <div className="flex items-center gap-2">
                        Membre
                        {sortField === 'nom' && (
                          <span className="text-primary">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Méthode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPointages.map((pointage) => (
                    <motion.tr
                      key={pointage.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-border/50 hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-foreground">
                            {new Date(pointage.date_heure).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(pointage.date_heure).toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {pointage.membre?.photo ? (
                            <img
                              src={pointage.membre.photo}
                              alt={`${pointage.membre.prenom} ${pointage.membre.nom}`}
                              className="w-10 h-10 rounded-full object-cover border-2 border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                              <span className="text-sm font-medium text-muted-foreground">
                                {pointage.membre?.prenom?.[0]}{pointage.membre?.nom?.[0]}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {pointage.membre?.prenom} {pointage.membre?.nom}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {pointage.membre?.role}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pointage.type === 'Entrée' ? 'default' : 'secondary'}
                          className={
                            pointage.type === 'Entrée'
                              ? 'bg-green-500/20 text-green-500 border-green-500/50 hover:bg-green-500/30'
                              : 'bg-orange-500/20 text-orange-500 border-orange-500/50 hover:bg-orange-500/30'
                          }
                        >
                          {pointage.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border/50">
                          {pointage.methode}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="gap-2"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
