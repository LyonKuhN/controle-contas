
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
    <div className="block md:hidden">
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 safe-area-pb">
        <div className="flex justify-center items-center p-3">
          <div className="flex items-center justify-around w-full max-w-md bg-background/90 backdrop-blur-md border border-border rounded-full px-3 py-2 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-full transition-all duration-300 min-w-[60px] ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Link>
            ))}
            
            {/* Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full p-2 min-w-[60px] h-auto flex flex-col gap-1 bg-background/80 backdrop-blur-md border border-border shadow-lg"
                >
                  <Menu className="w-4 h-4" />
                  <span className="text-xs font-medium">Menu</span>
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
        </div>
      </div>
      
      {/* Spacer to prevent content from being hidden behind fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default MobileNavigation;
