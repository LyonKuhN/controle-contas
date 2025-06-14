
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from "lucide-react";
import { useDespesas } from "@/hooks/useDespesas";
import { useCategorias } from "@/hooks/useCategorias";
import TipoTooltip from "./TipoTooltip";
import AddCategoriaDialog from "@/components/categorias/AddCategoriaDialog";

const CadastroDespesas = () => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria_id: '',
    data_vencimento: '',
    dia_vencimento: '', // Para despesas fixas
    tipo: 'variavel' as 'fixa' | 'variavel' | 'parcelada',
    observacoes: '',
    numero_parcelas: '',
    valor_total: '',
    tipo_valor: 'total' as 'total' | 'parcela'
  });

  const [showAddCategoria, setShowAddCategoria] = useState(false);

  const { createDespesa } = useDespesas();
  const { categorias } = useCategorias('despesa');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTipoChange = (value: 'fixa' | 'variavel' | 'parcelada') => {
    setFormData(prev => ({ 
      ...prev, 
      tipo: value,
      // Reset parcela fields when changing type
      numero_parcelas: value !== 'parcelada' ? '' : prev.numero_parcelas,
      valor_total: value !== 'parcelada' ? '' : prev.valor_total,
      tipo_valor: 'total',
      // Reset date fields when changing type
      data_vencimento: value === 'fixa' ? '' : prev.data_vencimento,
      dia_vencimento: value !== 'fixa' ? '' : prev.dia_vencimento
    }));
  };

  const createParcelasDespesa = async (despesaBase: any, numeroParcelas: number, dataInicial: string) => {
    const promises = [];
    
    for (let i = 0; i < numeroParcelas; i++) {
      // Criar data sem problemas de timezone
      const [year, month, day] = dataInicial.split('-').map(Number);
      const dataVencimento = new Date(year, month - 1 + i, day);
      
      const despesaParcela = {
        ...despesaBase,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        parcela_atual: i + 1
      };
      
      promises.push(createDespesa.mutateAsync(despesaParcela));
    }
    
    return Promise.all(promises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor || !formData.categoria_id) {
      return;
    }

    // Validação específica por tipo
    if (formData.tipo === 'fixa' && !formData.dia_vencimento) {
      return;
    }
    
    if (formData.tipo !== 'fixa' && !formData.data_vencimento) {
      return;
    }

    if (formData.tipo === 'parcelada' && !formData.numero_parcelas) {
      return;
    }

    let valorFinal = parseFloat(formData.valor);
    let valorTotal = valorFinal;
    let dataVencimento = formData.data_vencimento;

    // Para despesas fixas, criar uma data modelo usando o primeiro dia do mês atual com o dia selecionado
    if (formData.tipo === 'fixa') {
      const hoje = new Date();
      const diaVencimento = parseInt(formData.dia_vencimento);
      dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento).toISOString().split('T')[0];
    }

    // Calcular valores para despesas parceladas
    if (formData.tipo === 'parcelada') {
      const numeroParcelas = parseInt(formData.numero_parcelas);
      
      if (formData.tipo_valor === 'total') {
        valorFinal = valorTotal / numeroParcelas;
      } else {
        valorTotal = valorFinal * numeroParcelas;
      }
    }

    const despesaBase = {
      descricao: formData.descricao,
      valor: valorFinal,
      categoria_id: formData.categoria_id,
      tipo: formData.tipo,
      pago: false,
      observacoes: formData.observacoes || undefined,
      numero_parcelas: formData.tipo === 'parcelada' ? parseInt(formData.numero_parcelas) : undefined,
      valor_total: formData.tipo === 'parcelada' ? valorTotal : undefined
    };

    try {
      if (formData.tipo === 'fixa') {
        // Criar apenas uma despesa modelo para despesas fixas (não gerar para o mês atual)
        await createDespesa.mutateAsync({
          ...despesaBase,
          data_vencimento: dataVencimento,
          parcela_atual: undefined,
          is_modelo: true // Marcar explicitamente como modelo
        });
      } else if (formData.tipo === 'parcelada') {
        // Criar todas as parcelas automaticamente
        await createParcelasDespesa(despesaBase, parseInt(formData.numero_parcelas), dataVencimento);
      } else {
        // Criar despesa única (variável)
        await createDespesa.mutateAsync({
          ...despesaBase,
          data_vencimento: dataVencimento,
          parcela_atual: undefined,
          is_modelo: false
        });
      }

      // Reset form
      setFormData({
        descricao: '',
        valor: '',
        categoria_id: '',
        data_vencimento: '',
        dia_vencimento: '',
        tipo: 'variavel',
        observacoes: '',
        numero_parcelas: '',
        valor_total: '',
        tipo_valor: 'total'
      });
    } catch (error) {
      console.error('Erro ao cadastrar despesa:', error);
    }
  };

  return (
    <>
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
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <div className="flex gap-2">
              <Select value={formData.categoria_id} onValueChange={(value) => handleInputChange('categoria_id', value)}>
                <SelectTrigger className="flex-1">
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
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowAddCategoria(true)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="tipo">Tipo de Despesa *</Label>
              <TipoTooltip />
            </div>
            <Select value={formData.tipo} onValueChange={handleTipoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixa">🔒 Fixa (modelo)</SelectItem>
                <SelectItem value="variavel">🔄 Variável</SelectItem>
                <SelectItem value="parcelada">📅 Parcelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === 'fixa' && (
            <div>
              <Label htmlFor="dia_vencimento">Dia do Vencimento *</Label>
              <Select value={formData.dia_vencimento} onValueChange={(value) => handleInputChange('dia_vencimento', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia do mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                    <SelectItem key={dia} value={dia.toString()}>
                      Dia {dia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Esta despesa será salva como modelo. Use o botão "Gerar Despesas Fixas" no controle de contas para criar as despesas do mês.
              </p>
            </div>
          )}

          {formData.tipo === 'parcelada' && (
            <>
              <div>
                <Label htmlFor="numero_parcelas">Número de Parcelas *</Label>
                <Input
                  id="numero_parcelas"
                  type="number"
                  min="2"
                  value={formData.numero_parcelas}
                  onChange={(e) => handleInputChange('numero_parcelas', e.target.value)}
                  placeholder="Ex: 12"
                  required
                />
              </div>

              <div>
                <Label>O valor informado é: *</Label>
                <RadioGroup
                  value={formData.tipo_valor}
                  onValueChange={(value) => handleInputChange('tipo_valor', value)}
                  className="flex flex-row space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="total" id="total" />
                    <Label htmlFor="total">Valor total</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parcela" id="parcela" />
                    <Label htmlFor="parcela">Valor por parcela</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="valor">
              {formData.tipo === 'parcelada' 
                ? `Valor ${formData.tipo_valor === 'total' ? 'Total' : 'por Parcela'} *`
                : 'Valor *'
              }
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => handleInputChange('valor', e.target.value)}
              placeholder="0,00"
              required
            />
            {formData.tipo === 'parcelada' && formData.valor && formData.numero_parcelas && (
              <p className="text-sm text-muted-foreground mt-1">
                {formData.tipo_valor === 'total' 
                  ? `Valor por parcela: R$ ${(parseFloat(formData.valor) / parseInt(formData.numero_parcelas || '1')).toFixed(2)}`
                  : `Valor total: R$ ${(parseFloat(formData.valor) * parseInt(formData.numero_parcelas || '1')).toFixed(2)}`
                }
              </p>
            )}
          </div>

          {formData.tipo !== 'fixa' && (
            <div>
              <Label htmlFor="data_vencimento">
                {formData.tipo === 'parcelada' ? 'Data da Primeira Parcela *' : 'Data de Vencimento *'}
              </Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
                required
              />
              {formData.tipo === 'parcelada' && (
                <p className="text-sm text-muted-foreground mt-1">
                  As demais parcelas serão criadas automaticamente, mês a mês
                </p>
              )}
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

          <Button type="submit" className="w-full" disabled={createDespesa.isPending}>
            {createDespesa.isPending ? 'Cadastrando...' : 'Cadastrar Despesa'}
          </Button>
        </form>
      </Card>

      <AddCategoriaDialog 
        open={showAddCategoria}
        onClose={() => setShowAddCategoria(false)}
        tipo="despesa"
      />
    </>
  );
};

export default CadastroDespesas;
