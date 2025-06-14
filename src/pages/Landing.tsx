
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, BarChart3, Shield, Smartphone, Zap, CheckCircle, Star } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

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

  const benefits = [
    "Dashboard completo com gráficos em tempo real",
    "Controle total de despesas e receitas",
    "Categorização automática inteligente",
    "Relatórios detalhados e exportáveis",
    "Lembretes de pagamentos automáticos",
    "Interface responsiva para todos os dispositivos"
  ];

  return (
    <div className="min-h-screen">
      {/* Header com Logo */}
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
            <ThemeToggle />
            <Link to="/auth?mode=login">
              <Button variant="outline" className="border-primary/20 text-white hover:bg-primary/10">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Melhorada */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-5xl mx-auto mb-20">
          {/* Badge de Oferta */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 px-6 py-2 rounded-full mb-8">
            <Star className="w-4 h-4" />
            <span className="text-sm font-semibold">🎉 3 DIAS GRÁTIS - Sem cartão de crédito</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6 leading-tight">
            Controle Total das Suas Finanças
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
            A ferramenta mais completa para gerenciar seus gastos, receitas e investimentos. 
            <span className="text-primary font-semibold"> Experimente grátis por 3 dias</span> e descubra como é fácil ter controle total do seu dinheiro.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-lg px-12 py-6 min-w-[250px] bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-black font-bold shadow-xl">
                Começar 3 Dias Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <p className="text-sm text-muted-foreground">
              ✓ Sem compromisso • ✓ Cancele a qualquer momento
            </p>
          </div>

          {/* Preview do Sistema */}
          <div className="relative">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold mb-6 text-white">Veja como é simples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card/50 backdrop-blur rounded-lg p-6 border border-primary/10">
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="font-semibold mb-2">Dashboard Inteligente</h4>
                  <p className="text-sm text-muted-foreground">Gráficos em tempo real dos seus gastos</p>
                </div>
                <div className="bg-card/50 backdrop-blur rounded-lg p-6 border border-primary/10">
                  <div className="text-3xl mb-3">💸</div>
                  <h4 className="font-semibold mb-2">Controle de Despesas</h4>
                  <p className="text-sm text-muted-foreground">Categorização automática e inteligente</p>
                </div>
                <div className="bg-card/50 backdrop-blur rounded-lg p-6 border border-primary/10">
                  <div className="text-3xl mb-3">📋</div>
                  <h4 className="font-semibold mb-2">Relatórios Detalhados</h4>
                  <p className="text-sm text-muted-foreground">Análises completas do seu dinheiro</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefícios em Lista */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para <span className="text-primary">organizar suas finanças</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Recursos profissionais que fazem a diferença no seu dia a dia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-primary/10">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 text-center hover:scale-105 transition-all duration-300 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur"
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
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-12 mb-20 border border-primary/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Junte-se a milhares de usuários</h2>
            <p className="text-muted-foreground">Que já transformaram sua vida financeira</p>
          </div>
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
              <div className="text-muted-foreground text-lg">Satisfação</div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Plano Simples e <span className="text-primary">Transparente</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Comece grátis e continue pagando apenas o que vale a pena
          </p>

          <div className="max-w-md mx-auto">
            <Card className="p-8 border-2 border-primary bg-gradient-to-b from-primary/5 to-accent/5">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Plano Premium</h3>
                <div className="text-4xl font-bold text-primary mb-1">R$ 29,90</div>
                <div className="text-muted-foreground mb-6">/mês</div>
                
                <div className="bg-primary/20 text-primary text-sm font-semibold py-2 px-4 rounded-full mb-6">
                  3 DIAS GRÁTIS INCLUSOS
                </div>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Dashboard completo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Controle ilimitado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Relatórios avançados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Suporte prioritário</span>
                  </li>
                </ul>

                <Link to="/auth?mode=signup">
                  <Button className="w-full text-lg py-6 bg-gradient-to-r from-primary to-accent text-black font-bold">
                    Começar Teste Grátis
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA Section Final */}
        <div className="text-center bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-black">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Transformar suas Finanças?
          </h2>
          <p className="text-xl mb-8 text-black/80">
            Experimente por 3 dias grátis e veja como é fácil ter controle total do seu dinheiro.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="text-lg px-12 py-6 bg-black text-white hover:bg-black/90">
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-black/70 mt-4">
            ✓ Sem cartão de crédito • ✓ Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
