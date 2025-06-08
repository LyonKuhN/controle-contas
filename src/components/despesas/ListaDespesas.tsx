
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  tipo: 'fixa' | 'variavel' | 'parcelada';
  dataVencimento?: string;
  numeroParcelas?: number;
  observacoes?: string;
}

const ListaDespesas = () => {
  const despesas: Despesa[] = [
    {
      id: '1',
      descricao: 'Energia Elétrica',
      valor: 280.50,
      categoria: 'utilidades',
      tipo: 'fixa',
      dataVencimento: '2025-01-15'
    },
    {
      id: '2',
      descricao: 'Supermercado',
      valor: 350.00,
      categoria: 'alimentacao',
      tipo: 'variavel',
      dataVencimento: '2025-01-08'
    },
    {
      id: '3',
      descricao: 'Financiamento do Carro',
      valor: 580.00,
      categoria: 'transporte',
      tipo: 'parcelada',
      numeroParcelas: 48,
      dataVencimento: '2025-01-05'
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

  const getCategoriaLabel = (categoria: string) => {
    const categorias: Record<string, string> = {
      'alimentacao': 'Alimentação',
      'transporte': 'Transporte',
      'moradia': 'Moradia',
      'saude': 'Saúde',
      'educacao': 'Educação',
      'lazer': 'Lazer',
      'utilidades': 'Utilidades',
      'outros': 'Outros'
    };
    return categorias[categoria] || categoria;
  };

  const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Despesas Cadastradas</h2>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-primary">
            R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {despesas.map((despesa) => (
          <Card key={despesa.id} className="p-4 border border-border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{despesa.descricao}</h3>
                <p className="text-sm text-muted-foreground">
                  {getCategoriaLabel(despesa.categoria)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getTipoColor(despesa.tipo)} text-white`}>
                  {despesa.tipo}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-primary">
                  R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {despesa.dataVencimento && (
                  <p className="text-sm text-muted-foreground">
                    {despesa.tipo === 'variavel' ? 'Data do gasto' : 'Vencimento'}: {new Date(despesa.dataVencimento).toLocaleDateString('pt-BR')}
                  </p>
                )}
                {despesa.numeroParcelas && (
                  <p className="text-sm text-muted-foreground">
                    {despesa.numeroParcelas}x parcelas
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}

        {despesas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma despesa cadastrada ainda.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ListaDespesas;
