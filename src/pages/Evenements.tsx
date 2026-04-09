import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Filter, Search, MapPin, Users, Clock, Edit, Trash2, X } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO, isBefore, isAfter, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Evenement, TypeEvenement, TYPES_EVENEMENT } from '@/lib/index'

const mockEvenements: Evenement[] = [
  {
    id: '1',
    titre: 'Réunion mensuelle du personnel',
    description: 'Réunion de coordination et planification des activités du mois',
    type: 'Réunion',
    date_debut: '2026-04-15T09:00:00',
    date_fin: '2026-04-15T11:00:00',
    lieu: 'Salle de conférence MADE',
    participants: ['1', '2', '3'],
    created_at: '2026-04-01T10:00:00',
    updated_at: '2026-04-01T10:00:00',
  },
  {
    id: '2',
    titre: 'Formation premiers secours',
    description: 'Formation pratique aux gestes de premiers secours pour le personnel',
    type: 'Formation',
    date_debut: '2026-04-20T14:00:00',
    date_fin: '2026-04-20T17:00:00',
    lieu: 'Centre MADE',
    participants: ['1', '2', '3', '4', '5'],
    created_at: '2026-04-02T10:00:00',
    updated_at: '2026-04-02T10:00:00',
  },
  {
    id: '3',
    titre: 'Atelier créatif pour enfants',
    description: 'Activité artistique et ludique pour les enfants',
    type: 'Activité',
    date_debut: '2026-04-25T10:00:00',
    date_fin: '2026-04-25T12:00:00',
    lieu: 'Salle polyvalente',
    participants: ['6', '7', '8', '9'],
    created_at: '2026-04-03T10:00:00',
    updated_at: '2026-04-03T10:00:00',
  },
  {
    id: '4',
    titre: 'Distribution alimentaire',
    description: 'Distribution mensuelle de vivres aux familles bénéficiaires',
    type: 'Activité',
    date_debut: '2026-04-30T08:00:00',
    date_fin: '2026-04-30T12:00:00',
    lieu: 'Entrepôt MADE',
    participants: ['10', '11', '12'],
    created_at: '2026-04-04T10:00:00',
    updated_at: '2026-04-04T10:00:00',
  },
]

const typeColors: Record<TypeEvenement, string> = {
  Réunion: 'bg-primary/20 text-primary border-primary/30',
  Formation: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  Activité: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  Autre: 'bg-muted text-muted-foreground border-border',
}

const typeIcons: Record<TypeEvenement, typeof Users> = {
  Réunion: Users,
  Formation: Calendar,
  Activité: MapPin,
  Autre: Clock,
}

export default function Evenements() {
  const { toast } = useToast()
  const [evenements, setEvenements] = useState<Evenement[]>(mockEvenements)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeEvenement | 'all'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Evenement | null>(null)
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'Réunion' as TypeEvenement,
    date_debut: '',
    date_fin: '',
    lieu: '',
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const filteredEvenements = useMemo(() => {
    return evenements.filter((event) => {
      const matchesSearch = event.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || event.type === typeFilter
      const matchesDate = !selectedDate || isSameDay(parseISO(event.date_debut), selectedDate)
      return matchesSearch && matchesType && matchesDate
    })
  }, [evenements, searchQuery, typeFilter, selectedDate])

  const eventsOnDate = (date: Date) => {
    return evenements.filter((event) => isSameDay(parseISO(event.date_debut), date))
  }

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return evenements
      .filter((event) => isAfter(parseISO(event.date_debut), now))
      .sort((a, b) => parseISO(a.date_debut).getTime() - parseISO(b.date_debut).getTime())
      .slice(0, 3)
  }, [evenements])

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(isSameDay(date, selectedDate || new Date('1900-01-01')) ? null : date)
  }

  const handleAddEvent = () => {
    setEditingEvent(null)
    setFormData({
      titre: '',
      description: '',
      type: 'Réunion',
      date_debut: '',
      date_fin: '',
      lieu: '',
    })
    setIsDialogOpen(true)
  }

  const handleEditEvent = (event: Evenement) => {
    setEditingEvent(event)
    setFormData({
      titre: event.titre,
      description: event.description || '',
      type: event.type,
      date_debut: event.date_debut,
      date_fin: event.date_fin || '',
      lieu: event.lieu || '',
    })
    setIsDialogOpen(true)
  }

  const handleDeleteEvent = (id: string) => {
    setEvenements(evenements.filter((e) => e.id !== id))
    toast({
      title: 'Événement supprimé',
      description: 'L\'événement a été supprimé avec succès.',
    })
  }

  const handleSubmit = () => {
    if (!formData.titre || !formData.date_debut) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      })
      return
    }

    if (editingEvent) {
      setEvenements(
        evenements.map((e) =>
          e.id === editingEvent.id
            ? {
                ...e,
                ...formData,
                updated_at: new Date().toISOString(),
              }
            : e
        )
      )
      toast({
        title: 'Événement modifié',
        description: 'L\'événement a été modifié avec succès.',
      })
    } else {
      const newEvent: Evenement = {
        id: Date.now().toString(),
        ...formData,
        participants: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setEvenements([...evenements, newEvent])
      toast({
        title: 'Événement créé',
        description: 'L\'événement a été créé avec succès.',
      })
    }

    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Événements</h1>
            <p className="text-muted-foreground mt-1">
              Gestion des réunions, formations et activités
            </p>
          </div>
          <Button onClick={handleAddEvent} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un événement
          </Button>
        </div>
      </motion.div>

      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Événements à venir</h3>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((event) => {
                const Icon = typeIcons[event.type]
                return (
                  <div key={event.id} className="flex items-center gap-3 text-sm">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{event.titre}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {format(parseISO(event.date_debut), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  ←
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  →
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}

              {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {daysInMonth.map((day) => {
                const events = eventsOnDate(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isTodayDate = isToday(day)

                return (
                  <motion.button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative p-2 rounded-lg text-sm transition-colors
                      ${isTodayDate ? 'bg-primary text-primary-foreground font-semibold' : ''}
                      ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                      ${!isTodayDate && !isSelected ? 'hover:bg-accent' : ''}
                      ${!isSameMonth(day, currentMonth) ? 'text-muted-foreground/50' : ''}
                    `}
                  >
                    <div>{format(day, 'd')}</div>
                    {events.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {events.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              event.type === 'Réunion'
                                ? 'bg-primary'
                                : event.type === 'Formation'
                                ? 'bg-chart-2'
                                : 'bg-chart-4'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="space-y-4"
        >
          <Card className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un événement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Type d'événement</Label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TypeEvenement | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {TYPES_EVENEMENT.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDate && (
                <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
                  <span className="text-sm font-medium">
                    {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredEvenements.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Aucun événement trouvé</p>
                  </Card>
                </motion.div>
              ) : (
                filteredEvenements.map((event, index) => {
                  const Icon = typeIcons[event.type]
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{event.titre}</h3>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <Badge className={typeColors[event.type]} variant="outline">
                                  {event.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(parseISO(event.date_debut), 'dd MMM yyyy à HH:mm', { locale: fr })}
                              {event.date_fin && (
                                <> - {format(parseISO(event.date_fin), 'HH:mm', { locale: fr })}</>
                              )}
                            </span>
                          </div>
                          {event.lieu && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{event.lieu}</span>
                            </div>
                          )}
                          {event.participants && event.participants.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{event.participants.length} participant(s)</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Titre de l'événement"
              />
            </div>

            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as TypeEvenement })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_EVENEMENT.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'événement"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_debut">Date et heure de début *</Label>
                <Input
                  id="date_debut"
                  type="datetime-local"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date_fin">Date et heure de fin</Label>
                <Input
                  id="date_fin"
                  type="datetime-local"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lieu">Lieu</Label>
              <Input
                id="lieu"
                value={formData.lieu}
                onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                placeholder="Lieu de l'événement"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {editingEvent ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
