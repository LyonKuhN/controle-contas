
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReceitas } from "@/hooks/useReceitas";
import { useCategorias } from "@/hooks/useCategorias";

const CadastroReceitas = () => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria_id: '',
    data_recebimento: '',
    observacoes: ''
  });

  const { createReceita } = useReceitas();
  const { categorias } = useCategorias('receita');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor || !formData.categoria_id || !formData.data_recebimento) {
      return;
    }

    createReceita.mutate({
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      categoria_id: formData.categoria_id,
      data_recebimento: formData.data_recebimento,
      recebido: false,
      observacoes: formData.observacoes || undefined
    });

    // Reset form
    setFormData({
      descricao: '',
      valor: '',
      categoria_id: '',
      data_recebimento: '',
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
            required
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
            required
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria *</Label>
          <Select value={formData.categoria_id} onValueChange={(value) => handleInputChange('categoria_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="data_recebimento">Data de Recebimento *</Label>
          <Input
            id="data_recebimento"
            type="date"
            value={formData.data_recebimento}
            onChange={(e) => handleInputChange('data_recebimento', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Input
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder="Informações adicionais (opcional)"
          />
        </div>

        <Button type="submit" className="w-full" disabled={createReceita.isPending}>
          {createReceita.isPending ? 'Cadastrando...' : 'Cadastrar Receita'}
        </Button>
      </form>
    </Card>
  );
};

export default CadastroReceitas;
