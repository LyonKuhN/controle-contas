
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-primary-foreground">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Pronto para Transformar suas Finanças?
        </h2>
        <p className="text-xl mb-8 text-primary-foreground/80">
          Experimente por 3 dias grátis e veja como é fácil ter controle total do seu dinheiro.
        </p>
        <Link to="/auth?mode=signup">
          <Button size="lg" variant="secondary" className="text-lg px-12 py-6 bg-background text-foreground hover:bg-background/90">
            Começar Agora - É Grátis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <p className="text-sm text-primary-foreground/70 mt-4">
          ✓ Sem cartão de crédito • ✓ Cancele quando quiser
        </p>
      </div>
    </div>
  );
};

export default CTASection;
