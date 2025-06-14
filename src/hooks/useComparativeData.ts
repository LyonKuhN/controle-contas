
import { useDespesas } from './useDespesas';
import { useReceitas } from './useReceitas';
import { useCategorias } from './useCategorias';
import { useMemo } from 'react';

export const useComparativeData = () => {
  const { despesas } = useDespesas();
  const { receitas } = useReceitas();
  const { categorias } = useCategorias();

  const comparativeData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter current month data
    const currentMonthDespesas = despesas.filter(despesa => {
      const date = new Date(despesa.data_vencimento);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const currentMonthReceitas = receitas.filter(receita => {
      const date = new Date(receita.data_recebimento);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Filter last month data
    const lastMonthDespesas = despesas.filter(despesa => {
      const date = new Date(despesa.data_vencimento);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const lastMonthReceitas = receitas.filter(receita => {
      const date = new Date(receita.data_recebimento);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    // Calculate totals
    const currentTotalDespesas = currentMonthDespesas.reduce((acc, despesa) => acc + Number(despesa.valor), 0);
    const currentTotalReceitas = currentMonthReceitas.reduce((acc, receita) => acc + Number(receita.valor), 0);
    const currentSaldo = currentTotalReceitas - currentTotalDespesas;

    const lastTotalDespesas = lastMonthDespesas.reduce((acc, despesa) => acc + Number(despesa.valor), 0);
    const lastTotalReceitas = lastMonthReceitas.reduce((acc, receita) => acc + Number(receita.valor), 0);
    const lastSaldo = lastTotalReceitas - lastTotalDespesas;

    // Calculate percentages
    const despesasChange = lastTotalDespesas === 0 ? 100 : ((currentTotalDespesas - lastTotalDespesas) / lastTotalDespesas) * 100;
    const receitasChange = lastTotalReceitas === 0 ? 100 : ((currentTotalReceitas - lastTotalReceitas) / lastTotalReceitas) * 100;
    const saldoChange = lastSaldo === 0 ? (currentSaldo > 0 ? 100 : -100) : ((currentSaldo - lastSaldo) / Math.abs(lastSaldo)) * 100;

    // Despesas por categoria (mês atual)
    const despesasPorCategoria = currentMonthDespesas.reduce((acc, despesa) => {
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

    const dadosBarChart = [
      { name: 'Receitas', valor: currentTotalReceitas, fill: '#22c55e' },
      { name: 'Despesas', valor: currentTotalDespesas, fill: '#ef4444' },
    ];

    // Monthly comparison data
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonthName = monthNames[currentMonth];
    const lastMonthName = monthNames[lastMonth];

    const comparisonData = [
      {
        mes: lastMonthName,
        receitas: lastTotalReceitas,
        despesas: lastTotalDespesas,
        saldo: lastSaldo
      },
      {
        mes: currentMonthName,
        receitas: currentTotalReceitas,
        despesas: currentTotalDespesas,
        saldo: currentSaldo
      }
    ];

    return {
      current: {
        despesas: currentTotalDespesas,
        receitas: currentTotalReceitas,
        saldo: currentSaldo,
        monthName: currentMonthName
      },
      last: {
        despesas: lastTotalDespesas,
        receitas: lastTotalReceitas,
        saldo: lastSaldo,
        monthName: lastMonthName
      },
      changes: {
        despesas: despesasChange,
        receitas: receitasChange,
        saldo: saldoChange
      },
      charts: {
        pieChart: dadosPieChart,
        barChart: dadosBarChart,
        comparison: comparisonData
      }
    };
  }, [despesas, receitas, categorias]);

  return comparativeData;
};
