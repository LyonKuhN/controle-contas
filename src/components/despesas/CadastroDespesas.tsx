
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CadastroDespesas = () => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    tipo: '',
    dataVencimento: '',
    numeroParcelas: '',
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

    console.log('Despesa cadastrada:', formData);
    
    toast({
      title: "Sucesso",
      description: "Despesa cadastrada com sucesso!"
    });

    // Reset form
    setFormData({
      descricao: '',
      valor: '',
      categoria: '',
      tipo: '',
      dataVencimento: '',
      numeroParcelas: '',
      observacoes: ''
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Cadastrar Nova Despesa</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            placeholder="Ex: Energia elétrica"
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
              <SelectItem value="alimentacao">Alimentação</SelectItem>
              <SelectItem value="transporte">Transporte</SelectItem>
              <SelectItem value="moradia">Moradia</SelectItem>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="educacao">Educação</SelectItem>
              <SelectItem value="lazer">Lazer</SelectItem>
              <SelectItem value="utilidades">Utilidades</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tipo">Tipo de Despesa *</Label>
          <Select onValueChange={(value) => handleInputChange('tipo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixa">Fixa</SelectItem>
              <SelectItem value="variavel">Variável</SelectItem>
              <SelectItem value="parcelada">Parcelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campos condicionais baseado no tipo */}
        {formData.tipo === 'fixa' && (
          <div>
            <Label htmlFor="dataVencimento">Data de Vencimento</Label>
            <Input
              id="dataVencimento"
              type="date"
              value={formData.dataVencimento}
              onChange={(e) => handleInputChange('dataVencimento', e.target.value)}
            />
          </div>
        )}

        {formData.tipo === 'variavel' && (
          <div>
            <Label htmlFor="dataGasto">Data do Gasto</Label>
            <Input
              id="dataGasto"
              type="date"
              value={formData.dataVencimento}
              onChange={(e) => handleInputChange('dataVencimento', e.target.value)}
            />
          </div>
        )}

        {formData.tipo === 'parcelada' && (
          <>
            <div>
              <Label htmlFor="numeroParcelas">Número de Parcelas</Label>
              <Input
                id="numeroParcelas"
                type="number"
                min="1"
                value={formData.numeroParcelas}
                onChange={(e) => handleInputChange('numeroParcelas', e.target.value)}
                placeholder="Ex: 12"
              />
            </div>
            <div>
              <Label htmlFor="dataVencimento">Data da Primeira Parcela</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={formData.dataVencimento}
                onChange={(e) => handleInputChange('dataVencimento', e.target.value)}
              />
            </div>
          </>
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
          Cadastrar Despesa
        </Button>
      </form>
    </Card>
  );
};

export default CadastroDespesas;
