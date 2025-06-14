
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useStripePrice } from '@/hooks/useStripePrice';

const PricingSection = () => {
  const { priceData, loading } = useStripePrice();

  return (
    <div className="container mx-auto px-4 mb-20">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Plano Simples e <span className="text-primary">Transparente</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-12">
          Comece grátis e continue pagando apenas o que vale a pena
        </p>

        <div className="max-w-md mx-auto">
          <Card className="p-8 border-2 border-primary bg-gradient-to-b from-primary/5 to-accent/5">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-card-foreground">Plano Premium</h3>
              <div className="text-4xl font-bold text-primary mb-1">
                {loading ? 'Carregando...' : (priceData?.formatted || 'R$ 29,90')}
              </div>
              <div className="text-muted-foreground mb-6">/mês</div>
              
              <div className="bg-primary/20 text-primary text-sm font-semibold py-2 px-4 rounded-full mb-6">
                3 DIAS GRÁTIS INCLUSOS
              </div>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-card-foreground">Dashboard completo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-card-foreground">Controle ilimitado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-card-foreground">Relatórios avançados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-card-foreground">Suporte prioritário</span>
                </li>
              </ul>

              <Link to="/auth?mode=signup">
                <Button className="w-full text-lg py-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold hover:from-primary/90 hover:to-accent/90">
                  Começar Teste Grátis
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
