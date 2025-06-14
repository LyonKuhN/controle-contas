
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
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white dark:text-white light:text-gray-800">
          Plano Simples e <span className="text-primary">Transparente</span>
        </h2>
        <p className="text-xl text-gray-300 dark:text-gray-300 light:text-gray-600 mb-12">
          Comece grátis e continue pagando apenas o que vale a pena
        </p>

        <div className="max-w-md mx-auto">
          <Card className="p-8 border-2 border-primary bg-gradient-to-b from-primary/5 to-accent/5 dark:from-primary/5 dark:to-accent/5 light:from-primary/10 light:to-accent/10 dark:bg-card light:bg-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-white dark:text-white light:text-gray-800">Plano Premium</h3>
              <div className="text-4xl font-bold text-primary mb-1">
                {loading ? 'Carregando...' : (priceData?.formatted || 'R$ 29,90')}
              </div>
              <div className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">/mês</div>
              
              <div className="bg-primary/20 text-primary text-sm font-semibold py-2 px-4 rounded-full mb-6">
                3 DIAS GRÁTIS INCLUSOS
              </div>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-white dark:text-white light:text-gray-800">Dashboard completo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-white dark:text-white light:text-gray-800">Controle ilimitado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-white dark:text-white light:text-gray-800">Relatórios avançados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-white dark:text-white light:text-gray-800">Suporte prioritário</span>
                </li>
              </ul>

              <Link to="/auth?mode=signup">
                <Button className="w-full text-lg py-6 bg-gradient-to-r from-primary to-accent text-black font-bold hover:from-primary/90 hover:to-accent/90">
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
