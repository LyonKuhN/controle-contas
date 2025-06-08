
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDespesas } from "@/hooks/useDespesas";

const HistoricoPagamentos = () => {
  const { despesas, isLoading } = useDespesas();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando histórico...</div>
      </Card>
    );
  }

  // Filtrar apenas despesas pagas dos últimos 3 meses
  const hoje = new Date();
  const tresMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
  
  const despesasPagas = despesas.filter(despesa => 
    despesa.pago && 
    despesa.data_pagamento && 
    new Date(despesa.data_pagamento) >= tresMesesAtras
  ).sort((a, b) => {
    if (!a.data_pagamento || !b.data_pagamento) return 0;
    return new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime();
  });

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

  const totalPago = despesasPagas.reduce((total, despesa) => total + despesa.valor, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Total Pago nos Últimos 3 Meses</h3>
          <p className="text-2xl font-bold text-primary">
            R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </Card>

      {/* Lista do Histórico */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Histórico de Pagamentos</h2>
        <div className="space-y-4">
          {despesasPagas.map((despesa) => (
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
                <p className="text-lg font-bold text-primary">
                  R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {despesa.data_pagamento && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(despesa.data_pagamento).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </Card>
          ))}

          {despesasPagas.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum pagamento registrado nos últimos 3 meses.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoPagamentos;
