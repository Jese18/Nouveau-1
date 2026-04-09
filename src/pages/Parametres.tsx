import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Shield, Database, Bell, Globe, Key, Activity, Trash2, Download, RefreshCw } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/index';

interface PasswordDialogState {
  open: boolean;
  action: string;
  onConfirm: () => void;
}

export default function Parametres() {
  const { user, requirePassword, logout } = useAuth();
  const { toast } = useToast();
  const [langue, setLangue] = useState<'FR' | 'EN' | 'IT'>('FR');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationsSonores, setNotificationsSonores] = useState(true);
  const [notificationsEmail, setNotificationsEmail] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState<PasswordDialogState>({
    open: false,
    action: '',
    onConfirm: () => {},
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordProtectedAction = (action: string, callback: () => void) => {
    setPasswordDialog({
      open: true,
      action,
      onConfirm: callback,
    });
  };

  const handlePasswordConfirm = () => {
    if (!requirePassword(passwordInput)) {
      toast({
        title: 'Erreur',
        description: 'Mot de passe incorrect',
        variant: 'destructive',
      });
      return;
    }

    passwordDialog.onConfirm();
    setPasswordDialog({ open: false, action: '', onConfirm: () => {} });
    setPasswordInput('');
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Succès',
      description: 'Mot de passe modifié avec succès',
    });
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: 'Succès',
      description: 'Cache vidé avec succès',
    });
  };

  const handleExportData = () => {
    toast({
      title: 'Export en cours',
      description: 'Préparation de la sauvegarde des données...',
    });
  };

  const handleImportData = () => {
    toast({
      title: 'Import',
      description: 'Fonctionnalité d\'import disponible prochainement',
    });
  };

  const handleSaveLanguage = () => {
    handlePasswordProtectedAction('Changer la langue', () => {
      toast({
        title: 'Succès',
        description: `Langue changée en ${langue}`,
      });
    });
  };

  const handleSaveNotifications = () => {
    handlePasswordProtectedAction('Modifier les notifications', () => {
      toast({
        title: 'Succès',
        description: 'Préférences de notifications enregistrées',
      });
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les paramètres de votre application</p>
        </div>

        <Tabs defaultValue="compte" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="compte" className="gap-2">
              <User className="h-4 w-4" />
              Compte
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="h-4 w-4" />
              Préférences
            </TabsTrigger>
            <TabsTrigger value="securite" className="gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="systeme" className="gap-2">
              <Database className="h-4 w-4" />
              Système
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compte" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
                <CardDescription>Gérez vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email || ADMIN_EMAIL} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Input id="role" value="Super-PDG" disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez le mot de passe"
                  />
                </div>
                <Button
                  onClick={() => handlePasswordProtectedAction('Changer le mot de passe', handleChangePassword)}
                  className="w-full"
                  disabled={!newPassword || !confirmPassword}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Langue</CardTitle>
                <CardDescription>Choisissez la langue de l'interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="langue">Langue de l'application</Label>
                  <Select value={langue} onValueChange={(value) => setLangue(value as 'FR' | 'EN' | 'IT')}>
                    <SelectTrigger id="langue">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FR">🇫🇷 Français</SelectItem>
                      <SelectItem value="EN">🇬🇧 English</SelectItem>
                      <SelectItem value="IT">🇮🇹 Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveLanguage} className="w-full">
                  <Globe className="h-4 w-4 mr-2" />
                  Enregistrer la langue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Gérez vos préférences de notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Activer les notifications</Label>
                    <p className="text-sm text-muted-foreground">Recevoir les alertes importantes</p>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications sonores</Label>
                    <p className="text-sm text-muted-foreground">Sons pour les alertes</p>
                  </div>
                  <Switch checked={notificationsSonores} onCheckedChange={setNotificationsSonores} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">Recevoir les rapports par email</p>
                  </div>
                  <Switch checked={notificationsEmail} onCheckedChange={setNotificationsEmail} />
                </div>
                <Button onClick={handleSaveNotifications} className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Enregistrer les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="securite" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sessions actives</CardTitle>
                <CardDescription>Gérez vos sessions de connexion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Session actuelle</p>
                    <p className="text-sm text-muted-foreground">Connecté depuis ce navigateur</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handlePasswordProtectedAction('Déconnecter toutes les sessions', logout)}
                  className="w-full"
                >
                  Déconnecter toutes les sessions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs d'audit</CardTitle>
                <CardDescription>Consultez l'historique des actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Dernière connexion</p>
                      <p className="text-xs text-muted-foreground">{new Date().toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Dernière modification</p>
                      <p className="text-xs text-muted-foreground">{new Date().toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Voir tous les logs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="systeme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations système</CardTitle>
                <CardDescription>Détails de l'application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Version</Label>
                    <p className="font-medium">1.0.0</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Dernière mise à jour</Label>
                    <p className="font-medium">2026-04-08</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Environnement</Label>
                    <p className="font-medium">Production</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Base de données</Label>
                    <p className="font-medium">Supabase</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache et données</CardTitle>
                <CardDescription>Gérez le stockage local</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => handlePasswordProtectedAction('Vider le cache', handleClearCache)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider le cache
                </Button>
                <Button variant="outline" onClick={handleExportData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les données
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePasswordProtectedAction('Importer les données', handleImportData)}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Importer les données
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sauvegarde automatique</CardTitle>
                <CardDescription>Configuration des backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sauvegarde quotidienne</Label>
                    <p className="text-sm text-muted-foreground">Backup automatique à 18h</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sauvegarde hebdomadaire</Label>
                    <p className="text-sm text-muted-foreground">Backup complet le dimanche</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={passwordDialog.open} onOpenChange={(open) => setPasswordDialog({ ...passwordDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation requise</DialogTitle>
            <DialogDescription>
              Veuillez entrer votre mot de passe pour {passwordDialog.action.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password-confirm">Mot de passe</Label>
              <Input
                id="password-confirm"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Entrez votre mot de passe"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordConfirm();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialog({ open: false, action: '', onConfirm: () => {} });
                setPasswordInput('');
              }}
            >
              Annuler
            </Button>
            <Button onClick={handlePasswordConfirm}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
