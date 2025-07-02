
import { Card } from '@/components/ui/card';
import { BarChart3, Shield, Smartphone, Zap } from 'lucide-react';
import { useScrollAnimationList } from '@/hooks/useScrollAnimation';

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

  const { visibleItems, setRef } = useScrollAnimationList(features.length, { 
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  });

  return (
    <div className="container mx-auto px-4 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <Card 
            key={index}
            ref={setRef(index) as any}
            className={`p-8 text-center border-primary/20 hover:border-primary/40 bg-card/80 backdrop-blur transition-all duration-700 hover:scale-105 ${
              visibleItems[index]
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-8 scale-90'
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className="text-primary mb-4 flex justify-center">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-card-foreground">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturesGrid;
