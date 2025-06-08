
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  categoria: string;
  tipo: 'fixa' | 'variavel' | 'parcelada';
  paga: boolean;
}

const ContasPagar = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([
    {
      id: '1',
      descricao: 'Energia Elétrica',
      valor: 280.50,
      vencimento: '2025-01-15',
      categoria: 'Utilidades',
      tipo: 'fixa',
      paga: false
    },
    {
      id: '2',
      descricao: 'Internet',
      valor: 99.90,
      vencimento: '2025-01-10',
      categoria: 'Telecomunicações',
      tipo: 'fixa',
      paga: false
    },
    {
      id: '3',
      descricao: 'Supermercado',
      valor: 350.00,
      vencimento: '2025-01-08',
      categoria: 'Alimentação',
      tipo: 'variavel',
      paga: false
    }
  ]);

  const marcarComoPaga = (id: string) => {
    setDespesas(prev => 
      prev.map(despesa => 
        despesa.id === id ? { ...despesa, paga: true } : despesa
      )
    );
  };

  const contasAPagar = despesas.filter(d => !d.paga);
  const contasPagas = despesas.filter(d => d.paga);

  const getTipoColor = (tipo: string) => {
    switch(tipo) {
      case 'fixa': return 'bg-blue-500';
      case 'variavel': return 'bg-green-500';
      case 'parcelada': return 'bg-orange-500';
      default: return 'bg-gray-500';
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
                  <p className="text-sm text-muted-foreground">{despesa.categoria}</p>
                </div>
                <Badge className={`${getTipoColor(despesa.tipo)} text-white`}>
                  {despesa.tipo}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-primary">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Venc: {new Date(despesa.vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <Button 
                  onClick={() => marcarComoPaga(despesa.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pagar
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
                  <p className="text-sm text-muted-foreground">{despesa.categoria}</p>
                </div>
                <Badge className={`${getTipoColor(despesa.tipo)} text-white`}>
                  {despesa.tipo}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-green-600">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pago em: {new Date().toLocaleDateString('pt-BR')}
                  </p>
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
