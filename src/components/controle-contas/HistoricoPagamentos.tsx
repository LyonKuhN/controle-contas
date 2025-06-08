
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PagamentoHistorico {
  id: string;
  descricao: string;
  valor: number;
  dataPagamento: string;
  categoria: string;
  tipo: 'fixa' | 'variavel' | 'parcelada';
}

const HistoricoPagamentos = () => {
  const historico: PagamentoHistorico[] = [
    {
      id: '1',
      descricao: 'Energia Elétrica',
      valor: 265.30,
      dataPagamento: '2024-12-15',
      categoria: 'Utilidades',
      tipo: 'fixa'
    },
    {
      id: '2',
      descricao: 'Internet',
      valor: 99.90,
      dataPagamento: '2024-12-10',
      categoria: 'Telecomunicações',
      tipo: 'fixa'
    },
    {
      id: '3',
      descricao: 'Cartão de Crédito',
      valor: 1250.80,
      dataPagamento: '2024-12-08',
      categoria: 'Financeiro',
      tipo: 'variavel'
    },
    {
      id: '4',
      descricao: 'Financiamento do Carro',
      valor: 580.00,
      dataPagamento: '2024-12-05',
      categoria: 'Transporte',
      tipo: 'parcelada'
    }
  ];

  const getTipoColor = (tipo: string) => {
    switch(tipo) {
      case 'fixa': return 'bg-blue-500';
      case 'variavel': return 'bg-green-500';
      case 'parcelada': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const totalPago = historico.reduce((total, item) => total + item.valor, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Total Pago no Último Mês</h3>
          <p className="text-2xl font-bold text-primary">
            R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </Card>

      {/* Lista do Histórico */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Histórico de Pagamentos</h2>
        <div className="space-y-4">
          {historico.map((pagamento) => (
            <Card key={pagamento.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{pagamento.descricao}</h3>
                  <p className="text-sm text-muted-foreground">{pagamento.categoria}</p>
                </div>
                <Badge className={`${getTipoColor(pagamento.tipo)} text-white`}>
                  {pagamento.tipo}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-primary">
                  R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(pagamento.dataPagamento).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoricoPagamentos;
