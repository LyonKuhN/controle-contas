
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const CTASection = () => {
  const { ref: ctaRef, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <div className="container mx-auto px-4">
      <div 
        ref={ctaRef as any}
        className={`text-center bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-primary-foreground transition-all duration-700 ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-500 delay-200 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}>
          Pronto para Transformar suas Finanças?
        </h2>
        <p className={`text-xl mb-8 text-primary-foreground/80 transition-all duration-500 delay-400 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}>
          Experimente por 3 dias grátis e veja como é fácil ter controle total do seu dinheiro.
        </p>
        <div className={`flex justify-center transition-all duration-500 delay-600 ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95'
        }`}>
          <Link to="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="text-base px-8 py-4 bg-background text-foreground hover:bg-background/90">
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <p className={`text-sm text-primary-foreground/70 mt-4 transition-all duration-500 delay-700 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-2'
        }`}>
          ✓ Sem cartão de crédito • ✓ Cancele quando quiser
        </p>
      </div>
    </div>
  );
};

export default CTASection;
