
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, Undo } from "lucide-react";
import { useDespesas } from "@/hooks/useDespesas";
import { useState } from "react";
import EditDespesaDialog from "./EditDespesaDialog";
import { formatDateFromString } from "@/utils/dateUtils";

interface ContasPagarProps {
  currentDate: Date;
}

const ContasPagar = ({ currentDate }: ContasPagarProps) => {
  const { despesas, isLoading, updateDespesa } = useDespesas();
  const [editingDespesa, setEditingDespesa] = useState<any>(null);

  const marcarComoPaga = (id: string) => {
    updateDespesa.mutate({
      id,
      pago: true,
      data_pagamento: new Date().toISOString().split('T')[0]
    });
  };

  const desfazerPagamento = (id: string) => {
    updateDespesa.mutate({
      id,
      pago: false,
      data_pagamento: null
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando despesas...</div>
      </Card>
    );
  }

  // Corrigir lógica de filtro - incluir despesas do mês atual E atrasadas
  const hoje = new Date();
  const inicioMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const fimMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  console.log('Filtro de despesas:', {
    mesAtual: currentDate.toLocaleDateString('pt-BR'),
    inicioMes: inicioMes.toLocaleDateString('pt-BR'),
    fimMes: fimMes.toLocaleDateString('pt-BR'),
    totalDespesas: despesas.length
  });

  const despesasDoMes = despesas.filter(despesa => {
    const dataVencimento = new Date(despesa.data_vencimento);
    
    // Despesas do mês selecionado
    const isCurrentMonth = dataVencimento >= inicioMes && dataVencimento <= fimMes;
    
    // Despesas atrasadas (vencidas e não pagas) - só mostrar quando estiver visualizando o mês atual
    const isOverdue = dataVencimento < inicioMes && !despesa.pago && 
                     currentDate.getMonth() === hoje.getMonth() && 
                     currentDate.getFullYear() === hoje.getFullYear();

    console.log(`Despesa ${despesa.descricao}:`, {
      dataVencimento: dataVencimento.toLocaleDateString('pt-BR'),
      isCurrentMonth,
      isOverdue,
      pago: despesa.pago,
      incluir: isCurrentMonth || isOverdue
    });

    return isCurrentMonth || isOverdue;
  });

  const contasAPagar = despesasDoMes.filter(d => !d.pago);
  const contasPagas = despesasDoMes.filter(d => d.pago);

  const getTipoColor = (tipo: string) => {
    switch(tipo) {
      case 'fixa': return 'bg-blue-500';
      case 'variavel': return 'bg-green-500';
      case 'parcelada': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch(tipo) {
      case 'fixa': return 'Fixa';
      case 'variavel': return 'Variável';
      case 'parcelada': return 'Parcelada';
      default: return tipo;
    }
  };

  const isAtrasada = (dataVencimento: string) => {
    const vencimento = new Date(dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    vencimento.setHours(0, 0, 0, 0);
    return vencimento < hoje;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas a Pagar */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Contas a Pagar</h2>
          <div className="space-y-4">
            {contasAPagar.map((despesa) => (
              <Card key={despesa.id} className={`p-4 ${isAtrasada(despesa.data_vencimento) ? 'border-red-500 bg-red-50' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-semibold ${isAtrasada(despesa.data_vencimento) ? 'text-red-700' : 'text-foreground'}`}>
                      {despesa.descricao}
                      {isAtrasada(despesa.data_vencimento) && <span className="text-red-500 ml-2">⚠️ ATRASADA</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">{despesa.categoria?.nome}</p>
                    {despesa.tipo === 'parcelada' && (
                      <p className="text-xs text-muted-foreground">
                        Parcela {despesa.parcela_atual} de {despesa.numero_parcelas}
                      </p>
                    )}
                  </div>
                  <Badge className={`${getTipoColor(despesa.tipo || 'variavel')} text-white`}>
                    {getTipoLabel(despesa.tipo || 'variavel')}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-lg font-bold ${isAtrasada(despesa.data_vencimento) ? 'text-red-600' : 'text-primary'}`}>
                      R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm ${isAtrasada(despesa.data_vencimento) ? 'text-red-600' : 'text-muted-foreground'}`}>
                      Venc: {formatDateFromString(despesa.data_vencimento)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingDespesa(despesa)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => marcarComoPaga(despesa.id)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={updateDespesa.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {updateDespesa.isPending ? 'Pagando...' : 'Pagar'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {contasAPagar.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma conta para pagar este mês! 🎉</p>
              </Card>
            )}
          </div>
        </div>

        {/* Contas Pagas */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Contas Pagas</h2>
          <div className="space-y-4">
            {contasPagas.map((despesa) => (
              <Card key={despesa.id} className="p-4 bg-green-50 border-green-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-green-800">{despesa.descricao}</h3>
                    <p className="text-sm text-green-600">{despesa.categoria?.nome}</p>
                    {despesa.tipo === 'parcelada' && (
                      <p className="text-xs text-green-600">
                        Parcela {despesa.parcela_atual} de {despesa.numero_parcelas}
                      </p>
                    )}
                  </div>
                  <Badge className={`${getTipoColor(despesa.tipo || 'variavel')} text-white`}>
                    {getTipoLabel(despesa.tipo || 'variavel')}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-green-700">
                      R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {despesa.data_pagamento && (
                      <p className="text-sm text-green-600">
                        Pago em: {formatDateFromString(despesa.data_pagamento)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingDespesa(despesa)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => desfazerPagamento(despesa.id)}
                      className="text-orange-600 hover:text-orange-700"
                      disabled={updateDespesa.isPending}
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>
            ))}
            
            {contasPagas.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma conta paga ainda.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de Edição */}
      <EditDespesaDialog 
        despesa={editingDespesa}
        open={!!editingDespesa}
        onClose={() => setEditingDespesa(null)}
      />
    </>
  );
};

export default ContasPagar;
