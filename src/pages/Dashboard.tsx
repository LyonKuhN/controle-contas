
import { Card } from "@/components/ui/card";
import NavigationIsland from "@/components/NavigationIsland";
import { useDespesas } from "@/hooks/useDespesas";
import { useReceitas } from "@/hooks/useReceitas";
import { useCategorias } from "@/hooks/useCategorias";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const { despesas } = useDespesas();
  const { receitas } = useReceitas();
  const { categorias } = useCategorias();

  // Calcular totais
  const totalDespesas = despesas.reduce((acc, despesa) => acc + Number(despesa.valor), 0);
  const totalReceitas = receitas.reduce((acc, receita) => acc + Number(receita.valor), 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  // Despesas por categoria
  const despesasPorCategoria = despesas.reduce((acc, despesa) => {
    const categoria = categorias.find(cat => cat.id === despesa.categoria_id);
    const nomeCategoria = categoria?.nome || 'Sem categoria';
    acc[nomeCategoria] = (acc[nomeCategoria] || 0) + Number(despesa.valor);
    return acc;
  }, {} as Record<string, number>);

  const dadosPieChart = Object.entries(despesasPorCategoria).map(([nome, valor], index) => ({
    name: nome,
    value: valor,
    fill: `hsl(${index * 45}, 70%, 60%)`
  }));

  // Despesas por tipo
  const despesasPorTipo = despesas.reduce((acc, despesa) => {
    const tipo = despesa.tipo || 'variavel';
    acc[tipo] = (acc[tipo] || 0) + Number(despesa.valor);
    return acc;
  }, {} as Record<string, number>);

  const dadosBarChart = [
    { name: 'Receitas', valor: totalReceitas, fill: '#22c55e' },
    { name: 'Despesas', valor: totalDespesas, fill: '#ef4444' },
  ];

  const dadosTipos = Object.entries(despesasPorTipo).map(([tipo, valor]) => ({
    name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    valor: valor,
    fill: tipo === 'fixa' ? '#8b5cf6' : tipo === 'variavel' ? '#f59e0b' : '#06b6d4'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <NavigationIsland />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">📊 Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Análise completa das suas finanças</p>
        </div>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700 mb-2">💰 Total Receitas</h3>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-700 mb-2">💸 Total Despesas</h3>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
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
            </div>
          </Card>
        </div>

        {/* Gráficos */}
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

        {/* Gráfico de Tipos de Despesas */}
        {dadosTipos.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-center">Despesas por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosTipos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="valor" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
