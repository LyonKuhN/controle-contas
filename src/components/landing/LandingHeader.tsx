
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingHeader = () => {

  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/4fec2beb-6c7e-4cea-a53b-51b0335866ca.png" 
            alt="Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LYONPAY
          </span>
        </div>
        
        <div className="flex gap-4 items-center">
          <Link to="/auth?mode=login">
            <Button 
              variant="outline" 
              className="border-2 border-primary/60 text-foreground bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
