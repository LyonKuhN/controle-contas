
import { Card } from '@/components/ui/card';
import { BarChart3, Shield, Smartphone, Zap } from 'lucide-react';

const FeaturesGrid = () => {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Dashboard Inteligente",
      description: "Visualize seus gastos e receitas com gráficos detalhados e insights automáticos."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Segurança Total",
      description: "Seus dados estão protegidos com criptografia de ponta e autenticação segura."
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Acesso Móvel",
      description: "Gerencie suas finanças em qualquer lugar com nossa interface responsiva."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Automação Inteligente",
      description: "Categorização automática e lembretes para nunca perder um pagamento."
    }
  ];

  return (
    <div className="container mx-auto px-4 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="p-8 text-center hover:scale-105 transition-all duration-300 border-primary/20 hover:border-primary/40 bg-card/50 dark:bg-card/50 light:bg-white/80 backdrop-blur"
          >
            <div className="text-primary mb-4 flex justify-center">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white dark:text-white light:text-gray-800">{feature.title}</h3>
            <p className="text-muted-foreground dark:text-gray-300 light:text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturesGrid;
