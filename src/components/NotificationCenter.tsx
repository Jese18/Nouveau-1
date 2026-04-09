import { useState, useEffect } from 'react'
import { Bell, X, AlertCircle, Package, Calendar, UserX, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Notification, TypeNotification, NiveauPriorite } from '@/lib/index'

const NOTIFICATION_ICONS: Record<TypeNotification, typeof AlertCircle> = {
  Badge: AlertCircle,
  Pharmacie: Package,
  Événement: Calendar,
  Absence: UserX,
  Système: Info,
}

const PRIORITY_COLORS: Record<NiveauPriorite, string> = {
  Faible: 'bg-muted text-muted-foreground',
  Moyen: 'bg-accent text-accent-foreground',
  Élevé: 'bg-primary text-primary-foreground',
  Critique: 'bg-destructive text-destructive-foreground',
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'Badge',
    titre: 'Badge oublié',
    message: 'Jean Dupont a oublié son badge aujourd\'hui',
    priorite: 'Moyen',
    lu: false,
    membre_id: 'membre-1',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    type: 'Pharmacie',
    titre: 'Seuil pharmacie atteint',
    message: 'Le stock de Paracétamol est en dessous du seuil d\'alerte (5 unités restantes)',
    priorite: 'Élevé',
    lu: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '3',
    type: 'Événement',
    titre: 'Réunion imminente',
    message: 'Réunion mensuelle dans 30 minutes - Salle de conférence',
    priorite: 'Moyen',
    lu: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '4',
    type: 'Absence',
    titre: 'Absence longue durée',
    message: 'Marie Martin est absente depuis 8 jours consécutifs',
    priorite: 'Critique',
    lu: false,
    membre_id: 'membre-2',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '5',
    type: 'Système',
    titre: 'Rapport automatique généré',
    message: 'Le rapport quotidien de présence a été généré avec succès',
    priorite: 'Faible',
    lu: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
]

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.lu).length

  useEffect(() => {
    const newNotifications = notifications.filter(
      (n) => !n.lu && Date.now() - new Date(n.created_at).getTime() < 5000
    )

    newNotifications.forEach((notification) => {
      toast(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {(() => {
              const Icon = NOTIFICATION_ICONS[notification.type]
              return <Icon className="h-5 w-5 text-primary" />
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{notification.titre}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
          </div>
        </div>,
        {
          duration: 4000,
          style: {
            background: 'oklch(0.12 0.015 270)',
            border: '1px solid oklch(0.65 0.25 24)',
            color: 'oklch(0.98 0.005 270)',
          },
        }
      )
    })
  }, [notifications])

  const handleDismiss = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    )
  }

  const handleDismissAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent transition-colors"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
              >
                <span className="text-xs font-bold text-primary-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 bg-card border-border"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissAll}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground text-center">
                Aucune notification
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type]
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`relative px-4 py-3 hover:bg-accent/50 transition-colors ${
                      !notification.lu ? 'bg-accent/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 mt-0.5 p-2 rounded-lg ${
                          PRIORITY_COLORS[notification.priorite]
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {notification.titre}
                          </p>
                          {!notification.lu && (
                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.created_at)}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-0.5"
                            >
                              {notification.type}
                            </Badge>
                            {!notification.lu && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDismiss(notification.id)}
                                className="h-6 w-6 hover:bg-background"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
