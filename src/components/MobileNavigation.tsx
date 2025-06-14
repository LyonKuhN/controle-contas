
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, TrendingDown, TrendingUp, FileText, Menu, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SupportDialog from './SupportDialog';
import { useAuth } from '@/hooks/useAuth';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingDown, label: 'Despesas', path: '/despesas' },
    { icon: TrendingUp, label: 'Receitas', path: '/receitas' },
    { icon: FileText, label: 'Contas', path: '/controle-contas' },
  ];

  return (
    <div className="flex justify-between items-center w-full">
      {/* Left side - Navigation Island */}
      <div className="bg-background/80 backdrop-blur-md border border-border rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </div>

      {/* Right side - Menu Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="nav-island bg-background/80 backdrop-blur-md border border-border rounded-full p-3 shadow-lg"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex flex-col gap-4 mt-8">
            <div className="flex flex-col gap-3">
              <SupportDialog variant="outline" className="w-full justify-start" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tema</span>
                <ThemeToggle />
              </div>
              
              {user && (
                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
