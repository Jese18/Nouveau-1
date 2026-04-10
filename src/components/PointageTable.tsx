import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Calendar, Filter, ChevronLeft, ChevronRight, Users, LogIn, LogOut } from 'lucide-react';
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
  // --- ÉTATS ---
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

  // --- CALCUL DES STATISTIQUES EN DIRECT ---
  const stats = useMemo(() => {
    const presents = pointages.filter(p => p.type === 'Entrée').length - 
                    pointages.filter(p => p.type === 'Sortie').length;
    return {
      totalPresents: Math.max(0, presents),
      entreesJour: pointages.filter(p => p.type === 'Entrée').length,
      sortiesJour: pointages.filter(p => p.type === 'Sortie').length
    };
  }, [pointages]);

  // --- FILTRAGE ET TRI ---
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

    if (typeFilter !== 'all') filtered = filtered.filter((p) => p.type === typeFilter);
    if (methodeFilter !== 'all') filtered = filtered.filter((p) => p.methode === methodeFilter);

    filtered.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date_heure).getTime();
        const dateB = new Date(b.date_heure).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const nomA = `${a.membre?.nom || ''} ${a.membre?.prenom || ''}`.toLowerCase();
        const nomB = `${b.membre?.nom || ''} ${b.membre?.prenom || ''}`.toLowerCase();
        return sortOrder === 'asc' ? nomA.localeCompare(nomB) : nomB.localeCompare(nomA);
      }
    });

    return filtered;
  }, [pointages, searchTerm, typeFilter, methodeFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredPointages.length / ITEMS_PER_PAGE);
  const paginatedPointages = filteredPointages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- ACTIONS ---
  const handleExportExcel = () => {
    try {
      exportPointageToExcel(filteredPointages, dateDebut, dateFin);
      toast.success('Export Excel réussi');
    } catch (error) {
      toast.error("Erreur lors de l'export Excel");
    }
  };

  const handleExportPDF = () => {
    try {
      const debut = dateDebut || new Date().toISOString().split('T')[0];
      const fin = dateFin || new Date().toISOString().split('T')[0];
      generateRapportPointagePDF(filteredPointages, debut, fin);
      toast.success('Rapport PDF généré');
    } catch (error) {
      toast.error("Erreur lors de l'export PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* --- SECTION STATISTIQUES RAPIDES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-500/10 border-blue-500/20 flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-lg text-white"><Users size={24} /></div>
          <div>
            <p className="text-sm text-blue-500 font-medium">Présents Actuellement</p>
            <p className="text-2xl font-bold">{stats.totalPresents}</p>
          </div>
        </Card>
        <Card className="p-4 bg-green-500/10 border-green-500/20 flex items-center gap-4">
          <div className="p-3 bg-green-500 rounded-lg text-white"><LogIn size={24} /></div>
          <div>
            <p className="text-sm text-green-500 font-medium">Total Entrées</p>
            <p className="text-2xl font-bold">{stats.entreesJour}</p>
          </div>
        </Card>
        <Card className="p-4 bg-orange-500/10 border-orange-500/20 flex items-center gap-4">
          <div className="p-3 bg-orange-500 rounded-lg text-white"><LogOut size={24} /></div>
          <div>
            <p className="text-sm text-orange-500 font-medium">Total Sorties</p>
            <p className="text-2xl font-bold">{stats.sortiesJour}</p>
          </div>
        </Card>
      </div>

      {/* --- FILTRES --- */}
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
              <Button onClick={handleExportExcel} variant="outline" className="gap-2" disabled={filteredPointages.length === 0}>
                <Download size={16} /> Excel
              </Button>
              <Button onClick={handleExportPDF} variant="outline" className="gap-2" disabled={filteredPointages.length === 0}>
                <Download size={16} /> PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date début</label>
              <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date fin</label>
              <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypePointage | 'all')}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Entrée">Entrée</SelectItem>
                  <SelectItem value="Sortie">Sortie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Méthode</label>
              <Select value={methodeFilter} onValueChange={(v) => setMethodeFilter(v as MethodePointage | 'all')}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="Laser">Laser</SelectItem>
                  <SelectItem value="Manuel">Manuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* --- TABLEAU --- */}
      <Card className="overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => { setSortField('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                Date/Heure {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => { setSortField('nom'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                Membre {sortField === 'nom' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Méthode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode='popLayout'>
              {paginatedPointages.map((pointage) => (
                <motion.tr
                  key={pointage.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{new Date(pointage.date_heure).toLocaleDateString('fr-FR')}</span>
                      <span className="text-xs text-muted-foreground font-mono">{new Date(pointage.date_heure).toLocaleTimeString('fr-FR')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-xs font-bold text-primary">
                        {pointage.membre?.nom[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{pointage.membre?.prenom} {pointage.membre?.nom}</span>
                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">{pointage.membre?.role}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={pointage.type === 'Entrée' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/15 text-rose-600 border-rose-500/20'}>
                      {pointage.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-muted border border-border/50 uppercase tracking-widest">{pointage.methode}</span>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}