
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, BarChart3, Shield, Smartphone, Zap } from 'lucide-react';

const Landing = () => {
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
            Controle Total das Suas Finanças
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            A ferramenta mais completa para gerenciar seus gastos, receitas e investimentos. 
            Simples, poderosa e segura.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 min-w-[200px]">
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 min-w-[200px]">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 text-center hover:scale-105 transition-all duration-300 border-primary/20 hover:border-primary/40"
            >
              <div className="text-primary mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground text-lg">Usuários Ativos</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">R$ 50M+</div>
              <div className="text-muted-foreground text-lg">Controlados</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground text-lg">Uptime</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Transformar suas Finanças?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Junte-se a milhares de usuários que já estão no controle total do seu dinheiro.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Criar Conta Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
