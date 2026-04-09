import { ReactNode, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  UserPlus,
  Users,
  Baby,
  Heart,
  Activity,
  Calendar,
  Stethoscope,
  Pill,
  Settings,
  Bell,
  AlertTriangle,
  FileDown,
  FileText,
  ClipboardList,
  Monitor,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { path: ROUTE_PATHS.DASHBOARD, label: 'Tableau de bord', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: ROUTE_PATHS.STATISTIQUES, label: 'Statistiques', icon: <BarChart3 className="w-5 h-5" /> },
  { path: ROUTE_PATHS.ENREGISTRER, label: 'Enregistrer', icon: <UserPlus className="w-5 h-5" /> },
  { path: ROUTE_PATHS.PERSONNEL, label: 'Personnel', icon: <Users className="w-5 h-5" /> },
  { path: ROUTE_PATHS.MERES_ENFANTS, label: 'Mères/Enfants', icon: <Baby className="w-5 h-5" /> },
  { path: ROUTE_PATHS.BENEFICIAIRES, label: 'Bénéficiaires', icon: <Heart className="w-5 h-5" /> },
  { path: ROUTE_PATHS.SUIVI, label: 'Suivi', icon: <Activity className="w-5 h-5" /> },
  { path: ROUTE_PATHS.EVENEMENTS, label: 'Événements', icon: <Calendar className="w-5 h-5" /> },
  { path: ROUTE_PATHS.CABINET_MEDICAL, label: 'Cabinet médical', icon: <Stethoscope className="w-5 h-5" /> },
  { path: ROUTE_PATHS.MEDICAMENTS, label: 'Médicaments', icon: <Pill className="w-5 h-5" /> },
  { path: ROUTE_PATHS.PARAMETRES, label: 'Paramètres', icon: <Settings className="w-5 h-5" /> },
  { path: ROUTE_PATHS.NOTIFICATIONS, label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { path: ROUTE_PATHS.ALERTES, label: 'Alertes', icon: <AlertTriangle className="w-5 h-5" /> },
  { path: ROUTE_PATHS.EXPORTATION, label: 'Exportation', icon: <FileDown className="w-5 h-5" /> },
  { path: ROUTE_PATHS.RAPPORTS, label: 'Rapports', icon: <FileText className="w-5 h-5" /> },
  { path: ROUTE_PATHS.LISTE_PRESENCE, label: 'Liste présence', icon: <ClipboardList className="w-5 h-5" /> },
];

const pageTitles: Record<string, string> = {
  [ROUTE_PATHS.DASHBOARD]: 'Tableau de bord',
  [ROUTE_PATHS.STATISTIQUES]: 'Statistiques',
  [ROUTE_PATHS.ENREGISTRER]: 'Enregistrer un membre',
  [ROUTE_PATHS.PERSONNEL]: 'Gestion du personnel',
  [ROUTE_PATHS.MERES_ENFANTS]: 'Mères et enfants',
  [ROUTE_PATHS.BENEFICIAIRES]: 'Bénéficiaires',
  [ROUTE_PATHS.SUIVI]: 'Suivi des présences',
  [ROUTE_PATHS.EVENEMENTS]: 'Événements',
  [ROUTE_PATHS.CABINET_MEDICAL]: 'Cabinet médical',
  [ROUTE_PATHS.MEDICAMENTS]: 'Gestion des médicaments',
  [ROUTE_PATHS.PARAMETRES]: 'Paramètres',
  [ROUTE_PATHS.NOTIFICATIONS]: 'Notifications',
  [ROUTE_PATHS.ALERTES]: 'Alertes',
  [ROUTE_PATHS.EXPORTATION]: 'Exportation',
  [ROUTE_PATHS.RAPPORTS]: 'Rapports automatiques',
  [ROUTE_PATHS.LISTE_PRESENCE]: 'Liste de présence',
};

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPageTitle = pageTitles[location.pathname] || 'MADE ONG';

  const handleLogout = async () => {
    await logout();
    navigate(ROUTE_PATHS.LOGIN);
  };

  const handleKioskMode = () => {
    navigate(ROUTE_PATHS.MODE_KIOSQUE);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={`fixed top-0 left-0 h-screen bg-card border-r border-border transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-[280px]' : 'w-0'
        } lg:w-[280px] overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, oklch(0.12 0.015 270) 0%, oklch(0.10 0.012 270) 100%)',
          boxShadow: '0 8px 30px -6px color-mix(in srgb, var(--primary) 15%, transparent)',
        }}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <img
                src={IMAGES.MADE_LOGO_20260408_011427_37}
                alt="MADE Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">MADE ONG</h1>
                <p className="text-xs text-muted-foreground">Antananarivo</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-primary/30 hover:bg-primary/10 hover:border-primary"
              onClick={handleKioskMode}
            >
              <Monitor className="w-5 h-5" />
              <span>Mode Kiosque</span>
            </Button>
          </div>
        </div>
      </aside>

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-0'
        }`}
      >
        <header
          className="sticky top-0 z-40 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/80"
          style={{
            boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 8%, transparent)',
          }}
        >
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <h2 className="text-xl font-semibold">{currentPageTitle}</h2>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate(ROUTE_PATHS.NOTIFICATIONS)}
              >
                <Bell className="w-5 h-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.email.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.email || 'Admin'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Super-PDG</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.PARAMETRES)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-40 lg:hidden"
            >
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <aside
                className="absolute top-0 left-0 h-screen w-[280px] bg-card border-r border-border"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.12 0.015 270) 0%, oklch(0.10 0.012 270) 100%)',
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={IMAGES.MADE_LOGO_20260408_011427_37}
                        alt="MADE Logo"
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <h1 className="text-xl font-bold text-primary">MADE ONG</h1>
                        <p className="text-xs text-muted-foreground">Antananarivo</p>
                      </div>
                    </div>
                  </div>

                  <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-lg'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }`
                        }
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </NavLink>
                    ))}
                  </nav>

                  <div className="p-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-primary/30 hover:bg-primary/10 hover:border-primary"
                      onClick={() => {
                        handleKioskMode();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Monitor className="w-5 h-5" />
                      <span>Mode Kiosque</span>
                    </Button>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
