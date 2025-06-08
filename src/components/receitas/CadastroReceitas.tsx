
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CadastroReceitas = () => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    tipo: '',
    dataRecebimento: '',
    observacoes: ''
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor || !formData.categoria || !formData.tipo) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    console.log('Receita cadastrada:', formData);
    
    toast({
      title: "Sucesso",
      description: "Receita cadastrada com sucesso!"
    });

    // Reset form
    setFormData({
      descricao: '',
      valor: '',
      categoria: '',
      tipo: '',
      dataRecebimento: '',
      observacoes: ''
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Cadastrar Nova Receita</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            placeholder="Ex: Salário"
          />
        </div>

        <div>
          <Label htmlFor="valor">Valor *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            value={formData.valor}
            onChange={(e) => handleInputChange('valor', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria *</Label>
          <Select onValueChange={(value) => handleInputChange('categoria', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salario">Salário</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="investimentos">Investimentos</SelectItem>
              <SelectItem value="bonus">Bônus</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tipo">Tipo de Receita *</Label>
          <Select onValueChange={(value) => handleInputChange('tipo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixa">Fixa</SelectItem>
              <SelectItem value="variavel">Variável</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campos condicionais baseado no tipo */}
        {formData.tipo === 'fixa' && (
          <div>
            <Label htmlFor="dataRecebimento">Data de Recebimento Mensal</Label>
            <Input
              id="dataRecebimento"
              type="date"
              value={formData.dataRecebimento}
              onChange={(e) => handleInputChange('dataRecebimento', e.target.value)}
            />
          </div>
        )}

        {formData.tipo === 'variavel' && (
          <div>
            <Label htmlFor="dataRecebimento">Data do Recebimento</Label>
            <Input
              id="dataRecebimento"
              type="date"
              value={formData.dataRecebimento}
              onChange={(e) => handleInputChange('dataRecebimento', e.target.value)}
            />
          </div>
        )}

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Input
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder="Informações adicionais (opcional)"
          />
        </div>

        <Button type="submit" className="w-full">
          Cadastrar Receita
        </Button>
      </form>
    </Card>
  );
};

export default CadastroReceitas;
