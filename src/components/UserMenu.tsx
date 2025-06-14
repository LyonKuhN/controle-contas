
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, HelpCircle, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import SupportDialog from './SupportDialog';

const UserMenu = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="nav-island bg-transparent border-primary/20 hover:bg-primary/10 dark:text-white/80 dark:hover:text-white light:text-gray-700 light:hover:text-gray-900"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border border-border">
          <DropdownMenuItem onClick={() => setSupportDialogOpen(true)} className="cursor-pointer">
            <HelpCircle className="h-4 w-4 mr-2" />
            Suporte
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
            <div className="flex items-center">
              <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="ml-6">Alterar Tema</span>
            </div>
          </DropdownMenuItem>
          
          {user && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SupportDialog 
        variant="outline" 
        className="hidden" 
        open={supportDialogOpen}
        onOpenChange={setSupportDialogOpen}
      />
    </>
  );
};

export default UserMenu;
