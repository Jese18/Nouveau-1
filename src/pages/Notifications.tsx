import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Bell, Filter, Check, Trash2, Settings, AlertCircle, Package, Calendar, UserX, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { NotificationCenter } from '@/components/NotificationCenter'
import { Notification, TypeNotification, NiveauPriorite, TYPES_NOTIFICATION, NIVEAUX_PRIORITE } from '@/lib/index'

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'Badge',
    titre: 'Badge oublié',
    message: 'Jean Rakoto a oublié son badge aujourd\'hui',
    priorite: 'Moyen',
    lu: false,
    membre_id: 'membre-1',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    type: 'Pharmacie',
    titre: 'Stock faible',
    message: 'Paracétamol: stock actuel 15, seuil alerte 20',
    priorite: 'Élevé',
    lu: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    type: 'Événement',
    titre: 'Réunion imminente',
    message: 'Réunion mensuelle dans 1 heure',
    priorite: 'Moyen',
    lu: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: '4',
    type: 'Absence',
    titre: 'Absence prolongée',
    message: 'Marie Rasoamalala absente depuis 5 jours',
    priorite: 'Critique',
    lu: false,
    membre_id: 'membre-2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '5',
    type: 'Système',
    titre: 'Rapport généré',
    message: 'Rapport de présence quotidien disponible',
    priorite: 'Faible',
    lu: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: '6',
    type: 'Pharmacie',
    titre: 'Stock critique',
    message: 'Amoxicilline: stock actuel 3, seuil alerte 10',
    priorite: 'Critique',
    lu: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '7',
    type: 'Badge',
    titre: 'Badge expiré',
    message: 'Le badge de Paul Andrianina doit être renouvelé',
    priorite: 'Moyen',
    lu: true,
    membre_id: 'membre-3',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: '8',
    type: 'Événement',
    titre: 'Formation annulée',
    message: 'La formation prévue demain est reportée',
    priorite: 'Élevé',
    lu: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
]

const typeIcons: Record<TypeNotification, any> = {
  Badge: AlertCircle,
  Pharmacie: Package,
  Événement: Calendar,
  Absence: UserX,
  Système: Info,
}

const prioriteColors: Record<NiveauPriorite, string> = {
  Faible: 'bg-muted text-muted-foreground',
  Moyen: 'bg-accent text-accent-foreground',
  Élevé: 'bg-chart-4 text-primary-foreground',
  Critique: 'bg-destructive text-destructive-foreground',
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return 'Hier'
  return `Il y a ${diffDays} jours`
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [typeFilter, setTypeFilter] = useState<TypeNotification | 'Tous'>('Tous')
  const [prioriteFilter, setPrioriteFilter] = useState<NiveauPriorite | 'Tous'>('Tous')
  const [statutFilter, setStatutFilter] = useState<'Tous' | 'Lues' | 'Non lues'>('Tous')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (typeFilter !== 'Tous' && notif.type !== typeFilter) return false
      if (prioriteFilter !== 'Tous' && notif.priorite !== prioriteFilter) return false
      if (statutFilter === 'Lues' && !notif.lu) return false
      if (statutFilter === 'Non lues' && notif.lu) return false
      return true
    })
  }, [notifications, typeFilter, prioriteFilter, statutFilter])

  const stats = useMemo(() => {
    const total = notifications.length
    const nonLues = notifications.filter((n) => !n.lu).length
    const critiques = notifications.filter((n) => n.priorite === 'Critique' && !n.lu).length
    const parType = TYPES_NOTIFICATION.map((type) => ({
      type,
      count: notifications.filter((n) => n.type === type).length,
    }))
    return { total, nonLues, critiques, parType }
  }, [notifications])

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    )
    toast.success('Notification marquée comme lue')
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
    toast.success('Toutes les notifications marquées comme lues')
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success('Notification supprimée')
  }

  const handleDeleteAll = () => {
    setNotifications([])
    toast.success('Toutes les notifications supprimées')
  }

  const handleSaveSettings = () => {
    toast.success('Paramètres de notifications enregistrés')
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Bell className="w-10 h-10 text-primary" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez toutes vos notifications et alertes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  <Settings className="w-5 h-5 mr-2" />
                  Paramètres
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Paramètres de notifications</DialogTitle>
                  <DialogDescription>
                    Configurez vos préférences de notifications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notif-enabled" className="text-base">
                      Activer les notifications
                    </Label>
                    <Switch
                      id="notif-enabled"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled" className="text-base">
                      Son de notification
                    </Label>
                    <Switch
                      id="sound-enabled"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-enabled" className="text-base">
                      Notifications par email
                    </Label>
                    <Switch
                      id="email-enabled"
                      checked={emailEnabled}
                      onCheckedChange={setEmailEnabled}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  <Button onClick={handleSaveSettings} className="w-full" size="lg">
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <NotificationCenter />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non lues</p>
                <p className="text-3xl font-bold text-chart-4 mt-1">{stats.nonLues}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-chart-4" />
            </div>
          </Card>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critiques</p>
                <p className="text-3xl font-bold text-destructive mt-1">{stats.critiques}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </Card>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                <p className="text-3xl font-bold text-chart-2 mt-1">
                  {notifications.filter((n) => {
                    const diff = Date.now() - new Date(n.created_at).getTime()
                    return diff < 86400000
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-chart-2" />
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <Tabs defaultValue="toutes" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="toutes">Toutes</TabsTrigger>
                <TabsTrigger value="non-lues">Non lues ({stats.nonLues})</TabsTrigger>
                <TabsTrigger value="lues">Lues</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={stats.nonLues === 0}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Tout marquer comme lu
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tout supprimer
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeNotification | 'Tous')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tous les types</SelectItem>
                  {TYPES_NOTIFICATION.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={prioriteFilter} onValueChange={(v) => setPrioriteFilter(v as NiveauPriorite | 'Tous')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Toutes priorités</SelectItem>
                  {NIVEAUX_PRIORITE.map((priorite) => (
                    <SelectItem key={priorite} value={priorite}>
                      {priorite}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="toutes" className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune notification</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const Icon = typeIcons[notif.type]
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 rounded-lg border transition-all ${
                        notif.lu ? 'bg-muted/30 border-border' : 'bg-card border-primary/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          notif.lu ? 'bg-muted' : 'bg-primary/10'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            notif.lu ? 'text-muted-foreground' : 'text-primary'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h3 className={`font-semibold ${
                                notif.lu ? 'text-muted-foreground' : 'text-foreground'
                              }`}>
                                {notif.titre}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notif.message}
                              </p>
                            </div>
                            <Badge className={prioriteColors[notif.priorite]}>
                              {notif.priorite}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                {notif.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(notif.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notif.lu && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notif.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(notif.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </TabsContent>

            <TabsContent value="non-lues" className="space-y-3">
              {filteredNotifications.filter((n) => !n.lu).length === 0 ? (
                <div className="text-center py-12">
                  <Check className="w-16 h-16 text-chart-2 mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune notification non lue</p>
                </div>
              ) : (
                filteredNotifications
                  .filter((n) => !n.lu)
                  .map((notif) => {
                    const Icon = typeIcons[notif.type]
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-4 rounded-lg border bg-card border-primary/30"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground">
                                  {notif.titre}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notif.message}
                                </p>
                              </div>
                              <Badge className={prioriteColors[notif.priorite]}>
                                {notif.priorite}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs">
                                  {notif.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(notif.created_at)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notif.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(notif.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
              )}
            </TabsContent>

            <TabsContent value="lues" className="space-y-3">
              {filteredNotifications.filter((n) => n.lu).length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune notification lue</p>
                </div>
              ) : (
                filteredNotifications
                  .filter((n) => n.lu)
                  .map((notif) => {
                    const Icon = typeIcons[notif.type]
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-4 rounded-lg border bg-muted/30 border-border"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-muted-foreground">
                                  {notif.titre}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notif.message}
                                </p>
                              </div>
                              <Badge className={prioriteColors[notif.priorite]}>
                                {notif.priorite}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-xs">
                                  {notif.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(notif.created_at)}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(notif.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
              )}
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Statistiques par type</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.parType.map(({ type, count }) => {
              const Icon = typeIcons[type]
              return (
                <div key={type} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{type}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
