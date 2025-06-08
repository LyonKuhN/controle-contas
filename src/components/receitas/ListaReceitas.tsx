
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Receita {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  tipo: 'fixa' | 'variavel';
  dataRecebimento?: string;
  observacoes?: string;
}

const ListaReceitas = () => {
  const receitas: Receita[] = [
    {
      id: '1',
      descricao: 'Salário',
      valor: 5500.00,
      categoria: 'salario',
      tipo: 'fixa',
      dataRecebimento: '2025-01-05'
    },
    {
      id: '2',
      descricao: 'Freelance Design',
      valor: 800.00,
      categoria: 'freelance',
      tipo: 'variavel',
      dataRecebimento: '2025-01-15'
    },
    {
      id: '3',
      descricao: 'Dividendos',
      valor: 120.50,
      categoria: 'investimentos',
      tipo: 'variavel',
      dataRecebimento: '2025-01-10'
    }
  ];

  const getTipoColor = (tipo: string) => {
    switch(tipo) {
      case 'fixa': return 'bg-blue-500';
      case 'variavel': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const categorias: Record<string, string> = {
      'salario': 'Salário',
      'freelance': 'Freelance',
      'investimentos': 'Investimentos',
      'bonus': 'Bônus',
      'vendas': 'Vendas',
      'aluguel': 'Aluguel',
      'outros': 'Outros'
    };
    return categorias[categoria] || categoria;
  };

  const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Receitas Cadastradas</h2>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-green-600">
            R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {receitas.map((receita) => (
          <Card key={receita.id} className="p-4 border border-border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{receita.descricao}</h3>
                <p className="text-sm text-muted-foreground">
                  {getCategoriaLabel(receita.categoria)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getTipoColor(receita.tipo)} text-white`}>
                  {receita.tipo}
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
                <p className="text-lg font-bold text-green-600">
                  R$ {receita.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {receita.dataRecebimento && (
                  <p className="text-sm text-muted-foreground">
                    {receita.tipo === 'fixa' ? 'Recebimento mensal' : 'Data do recebimento'}: {new Date(receita.dataRecebimento).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}

        {receitas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma receita cadastrada ainda.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ListaReceitas;
