
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useDespesas } from "@/hooks/useDespesas";

const ContasPagar = () => {
  const { despesas, isLoading, updateDespesa } = useDespesas();

  const marcarComoPaga = (id: string) => {
    updateDespesa.mutate({
      id,
      pago: true,
      data_pagamento: new Date().toISOString().split('T')[0]
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando despesas...</div>
      </Card>
    );
  }

  // Filtrar despesas do mês atual
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const despesasDoMes = despesas.filter(despesa => {
    const dataVencimento = new Date(despesa.data_vencimento);
    return dataVencimento >= inicioMes && dataVencimento <= fimMes;
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Contas a Pagar */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Contas a Pagar</h2>
        <div className="space-y-4">
          {contasAPagar.map((despesa) => (
            <Card key={despesa.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{despesa.descricao}</h3>
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
                  <p className="text-lg font-bold text-primary">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Venc: {new Date(despesa.data_vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <Button 
                  onClick={() => marcarComoPaga(despesa.id)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={updateDespesa.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {updateDespesa.isPending ? 'Pagando...' : 'Pagar'}
                </Button>
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
                  <h3 className="font-semibold">{despesa.descricao}</h3>
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
                  <p className="text-lg font-bold text-green-600">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {despesa.data_pagamento && (
                    <p className="text-sm text-muted-foreground">
                      Pago em: {new Date(despesa.data_pagamento).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                
                <CheckCircle className="w-6 h-6 text-green-600" />
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
  );
};

export default ContasPagar;
