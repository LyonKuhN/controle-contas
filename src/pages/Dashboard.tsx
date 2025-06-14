
import { Card } from "@/components/ui/card";
import NavigationIsland from "@/components/NavigationIsland";
import MobileNavigation from "@/components/MobileNavigation";
import UserMenu from "@/components/UserMenu";
import TrialNotification from "@/components/TrialNotification";
import { useAuth } from "@/hooks/useAuth";
import { useDespesas } from "@/hooks/useDespesas";
import { useReceitas } from "@/hooks/useReceitas";
import { useCategorias } from "@/hooks/useCategorias";
import { useComparativeData } from "@/hooks/useComparativeData";
import { useIsMobile } from "@/hooks/use-mobile";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Lightbulb, Calendar, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { user } = useAuth();
  const { despesas } = useDespesas();
  const { receitas } = useReceitas();
  const { categorias } = useCategorias();
  const comparativeData = useComparativeData();
  const isMobile = useIsMobile();

  // Calcular totais
  const totalDespesas = despesas.reduce((acc, despesa) => acc + Number(despesa.valor), 0);
  const totalReceitas = receitas.reduce((acc, receita) => acc + Number(receita.valor), 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  // Métricas avançadas
  const despesasPagas = despesas.filter(d => d.pago);
  const despesasPendentes = despesas.filter(d => !d.pago);
  const receitasRecebidas = receitas.filter(r => r.recebido);
  const receitasPendentes = receitas.filter(r => !r.recebido);

  const taxaPagamento = despesas.length > 0 ? (despesasPagas.length / despesas.length) * 100 : 0;
  const taxaRecebimento = receitas.length > 0 ? (receitasRecebidas.length / receitas.length) * 100 : 0;

  // Análise de categorias (top 3 gastos)
  const despesasPorCategoria = despesas.reduce((acc, despesa) => {
    const categoria = categorias.find(cat => cat.id === despesa.categoria_id);
    const nomeCategoria = categoria?.nome || 'Sem categoria';
    acc[nomeCategoria] = (acc[nomeCategoria] || 0) + Number(despesa.valor);
    return acc;
  }, {} as Record<string, number>);

  const topCategorias = Object.entries(despesasPorCategoria)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Despesas vencidas
  const hoje = new Date();
  const despesasVencidas = despesas.filter(d => 
    !d.pago && new Date(d.data_vencimento) < hoje
  );

  // Análise de tendência (comparação com mês anterior)
  const tendenciaReceitas = comparativeData.changes.receitas;
  const tendenciaDespesas = comparativeData.changes.despesas;
  const tendenciaSaldo = comparativeData.changes.saldo;

  const dadosPieChart = Object.entries(despesasPorCategoria).map(([nome, valor], index) => ({
    name: nome,
    value: valor,
    fill: `hsl(${index * 45}, 70%, 60%)`
  }));

  const dadosBarChart = [
    { name: 'Receitas', valor: totalReceitas, fill: '#22c55e' },
    { name: 'Despesas', valor: totalDespesas, fill: '#ef4444' },
  ];

  // Dados de tendência mensal
  const dadosTendencia = [
    { 
      mes: comparativeData.last.monthName, 
      receitas: comparativeData.last.receitas, 
      despesas: comparativeData.last.despesas 
    },
    { 
      mes: comparativeData.current.monthName, 
      receitas: comparativeData.current.receitas, 
      despesas: comparativeData.current.despesas 
    }
  ];

  // Função para gerar dicas personalizadas
  const gerarDicas = () => {
    const dicas = [];

    if (saldoLiquido < 0) {
      dicas.push({
        tipo: 'alerta',
        titulo: 'Atenção: Saldo Negativo',
        descricao: 'Suas despesas estão superiores às receitas. Revise seus gastos e considere cortar despesas não essenciais.',
        icon: AlertTriangle,
        cor: 'text-red-600'
      });
    }

    if (despesasVencidas.length > 0) {
      dicas.push({
        tipo: 'urgente',
        titulo: `${despesasVencidas.length} Despesa(s) Vencida(s)`,
        descricao: 'Você tem despesas em atraso. Quite-as o quanto antes para evitar juros e multas.',
        icon: Calendar,
        cor: 'text-orange-600'
      });
    }

    if (taxaPagamento < 70) {
      dicas.push({
        tipo: 'organizacao',
        titulo: 'Melhore a Organização',
        descricao: 'Apenas ' + taxaPagamento.toFixed(0) + '% das suas despesas estão quitadas. Considere usar lembretes.',
        icon: CheckCircle,
        cor: 'text-blue-600'
      });
    }

    if (totalDespesas > totalReceitas * 0.8) {
      dicas.push({
        tipo: 'economia',
        titulo: 'Gastos Elevados',
        descricao: 'Suas despesas representam mais de 80% da receita. Tente economizar pelo menos 20%.',
        icon: Target,
        cor: 'text-purple-600'
      });
    }

    if (topCategorias.length > 0 && topCategorias[0][1] > totalDespesas * 0.4) {
      dicas.push({
        tipo: 'categoria',
        titulo: 'Concentração de Gastos',
        descricao: `A categoria "${topCategorias[0][0]}" representa ${((topCategorias[0][1] / totalDespesas) * 100).toFixed(0)}% dos seus gastos. Considere diversificar.`,
        icon: Lightbulb,
        cor: 'text-green-600'
      });
    }

    if (tendenciaDespesas > 20) {
      dicas.push({
        tipo: 'tendencia',
        titulo: 'Aumento de Gastos',
        descricao: `Seus gastos aumentaram ${tendenciaDespesas.toFixed(0)}% em relação ao mês passado. Monitore de perto.`,
        icon: TrendingUp,
        cor: 'text-red-600'
      });
    }

    return dicas.slice(0, 4); // Máximo 4 dicas
  };

  const dicas = gerarDicas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center"></div>
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
          <NavigationIsland />
        </div>
      </div>

      {/* Mobile Layout - Top Header */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-foreground">📊 Dashboard</h1>
            <UserMenu />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <TrialNotification />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 hidden md:block">📊 Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Análise completa das suas finanças</p>
        </div>
        
        {/* Cards de Resumo Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700 mb-2">💰 Total Receitas</h3>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {tendenciaReceitas !== 0 && (
                <div className={`flex items-center justify-center mt-2 ${tendenciaReceitas > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tendenciaReceitas > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  <span className="text-sm">{Math.abs(tendenciaReceitas).toFixed(1)}% vs mês anterior</span>
                </div>
              )}
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-700 mb-2">💸 Total Despesas</h3>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {tendenciaDespesas !== 0 && (
                <div className={`flex items-center justify-center mt-2 ${tendenciaDespesas > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {tendenciaDespesas > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  <span className="text-sm">{Math.abs(tendenciaDespesas).toFixed(1)}% vs mês anterior</span>
                </div>
              )}
            </div>
          </Card>
          
          <Card className={`p-6 ${saldoLiquido >= 0 ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200' : 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200'}`}>
            <div className="text-center">
              <h3 className={`text-lg font-semibold mb-2 ${saldoLiquido >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                📈 Saldo Líquido
              </h3>
              <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {tendenciaSaldo !== 0 && (
                <div className={`flex items-center justify-center mt-2 ${tendenciaSaldo > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tendenciaSaldo > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  <span className="text-sm">{Math.abs(tendenciaSaldo).toFixed(1)}% vs mês anterior</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Cards de Métricas Avançadas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Pagamento</p>
                <p className="text-2xl font-bold text-blue-600">{taxaPagamento.toFixed(0)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Recebimento</p>
                <p className="text-2xl font-bold text-green-600">{taxaRecebimento.toFixed(0)}%</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{despesasPendentes.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{despesasVencidas.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Seção de Dicas e Alertas */}
        {dicas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">💡 Dicas Personalizadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dicas.map((dica, index) => (
                <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-start gap-3">
                    <dica.icon className={`w-5 h-5 mt-0.5 ${dica.cor}`} />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{dica.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{dica.descricao}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Top Categorias */}
        {topCategorias.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🎯 Principais Categorias de Gastos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCategorias.map(([categoria, valor], index) => (
                <Card key={categoria} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{categoria}</h4>
                      <p className="text-sm text-muted-foreground">
                        {((valor / totalDespesas) * 100).toFixed(1)}% do total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Pizza - Despesas por Categoria */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-center">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPieChart}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, percent}) => `${name} (${(percent * 100).toFixed(1)}%)`}
                >
                  {dadosPieChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Barras - Receitas vs Despesas */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-center">Receitas vs Despesas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosBarChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="valor" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Gráfico de Tendência Mensal */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 text-center">Tendência Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosTendencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Line type="monotone" dataKey="receitas" stroke="#22c55e" strokeWidth={3} name="Receitas" />
              <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={3} name="Despesas" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Dashboard;
