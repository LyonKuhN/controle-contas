
import { CheckCircle } from 'lucide-react';

const BenefitsList = () => {
  const benefits = [
    "Dashboard completo com gráficos em tempo real",
    "Controle total de despesas e receitas",
    "Categorização automática inteligente",
    "Relatórios detalhados e exportáveis",
    "Lembretes de pagamentos automáticos",
    "Interface responsiva para todos os dispositivos"
  ];

  return (
    <div className="container mx-auto px-4 mb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white dark:text-white light:text-gray-800">
          Tudo que você precisa para <span className="text-primary">organizar suas finanças</span>
        </h2>
        <p className="text-xl text-muted-foreground dark:text-gray-300 light:text-gray-600">
          Recursos profissionais que fazem a diferença no seu dia a dia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-3 p-4 bg-card/30 dark:bg-card/30 light:bg-white/80 rounded-lg border border-primary/10">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-foreground dark:text-white light:text-gray-800">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsList;
