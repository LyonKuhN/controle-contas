import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDespesas } from '@/hooks/useDespesas';
import { useReceitas } from '@/hooks/useReceitas';
import { formatDateFromString } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface DayData {
  date: string;
  despesas: any[];
  receitas: any[];
  totalDespesas: number;
  totalReceitas: number;
  totalPago: number;
  totalRecebido: number;
  saldoDia: number;
}

export const CalendarioFinanceiro = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  const { despesas } = useDespesas();
  const { receitas } = useReceitas();

  // Calcular dados por dia do mês
  const monthData = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dataByDay: { [key: string]: DayData } = {};
    
    // Inicializar todos os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dataByDay[dateStr] = {
        date: dateStr,
        despesas: [],
        receitas: [],
        totalDespesas: 0,
        totalReceitas: 0,
        totalPago: 0,
        totalRecebido: 0,
        saldoDia: 0
      };
    }

    // Adicionar despesas
    despesas?.forEach(despesa => {
      if (despesa.data_vencimento && despesa.data_vencimento.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
        const dayData = dataByDay[despesa.data_vencimento];
        if (dayData) {
          dayData.despesas.push(despesa);
          dayData.totalDespesas += parseFloat(despesa.valor?.toString() || '0');
          if (despesa.pago) {
            dayData.totalPago += parseFloat(despesa.valor?.toString() || '0');
          }
        }
      }
    });

    // Adicionar receitas
    receitas?.forEach(receita => {
      if (receita.data_recebimento && receita.data_recebimento.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
        const dayData = dataByDay[receita.data_recebimento];
        if (dayData) {
          dayData.receitas.push(receita);
          dayData.totalReceitas += parseFloat(receita.valor?.toString() || '0');
          if (receita.recebido) {
            dayData.totalRecebido += parseFloat(receita.valor?.toString() || '0');
          }
        }
      }
    });

    // Calcular saldo do dia
    Object.values(dataByDay).forEach(dayData => {
      dayData.saldoDia = dayData.totalRecebido - dayData.totalPago;
    });

    return dataByDay;
  }, [despesas, receitas, selectedMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDayInfo = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return monthData[dateStr];
  };

  const selectedDayData = selectedDate ? getDayInfo(selectedDate) : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Calendário Financeiro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Calendário Financeiro</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              className="pointer-events-auto"
              components={{
                Day: ({ date, ...props }) => {
                  const dayInfo = getDayInfo(date);
                  const hasData = dayInfo && (dayInfo.despesas.length > 0 || dayInfo.receitas.length > 0);
                  
                  return (
                    <div className="relative">
                      <button
                        {...props}
                        className={cn(
                          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground relative",
                          hasData && "bg-primary/10 border border-primary/20"
                        )}
                      />
                      {hasData && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {dayInfo.despesas.length > 0 && (
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          )}
                          {dayInfo.receitas.length > 0 && (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
            
            {/* Legenda */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm">Despesas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">Receitas</span>
              </div>
            </div>
          </div>

          {/* Detalhes do dia selecionado */}
          <div className="space-y-4">
            {selectedDayData ? (
              <>
                <h3 className="text-lg font-semibold">
                  {formatDateFromString(selectedDayData.date)}
                </h3>
                
                {/* Resumo do dia */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                    <div className="text-sm text-red-600 dark:text-red-400">Despesas</div>
                    <div className="font-semibold">
                      R$ {selectedDayData.totalDespesas.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pago: R$ {selectedDayData.totalPago.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <div className="text-sm text-green-600 dark:text-green-400">Receitas</div>
                    <div className="font-semibold">
                      R$ {selectedDayData.totalReceitas.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Recebido: R$ {selectedDayData.totalRecebido.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Saldo do dia */}
                <div className={`p-3 rounded-lg ${
                  selectedDayData.saldoDia >= 0 
                    ? 'bg-green-50 dark:bg-green-950/20' 
                    : 'bg-red-50 dark:bg-red-950/20'
                }`}>
                  <div className="text-sm font-medium">Saldo do Dia</div>
                  <div className={`text-lg font-bold ${
                    selectedDayData.saldoDia >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    R$ {selectedDayData.saldoDia.toFixed(2)}
                  </div>
                </div>

                {/* Lista de despesas */}
                {selectedDayData.despesas.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Despesas</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedDayData.despesas.map((despesa) => (
                        <div key={despesa.id} className="flex items-center justify-between text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded">
                          <span>{despesa.descricao}</span>
                          <div className="flex items-center gap-2">
                            <span>R$ {parseFloat(despesa.valor || 0).toFixed(2)}</span>
                            <Badge variant={despesa.pago ? "default" : "secondary"}>
                              {despesa.pago ? "Pago" : "Pendente"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de receitas */}
                {selectedDayData.receitas.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Receitas</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedDayData.receitas.map((receita) => (
                        <div key={receita.id} className="flex items-center justify-between text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                          <span>{receita.descricao}</span>
                          <div className="flex items-center gap-2">
                            <span>R$ {parseFloat(receita.valor || 0).toFixed(2)}</span>
                            <Badge variant={receita.recebido ? "default" : "secondary"}>
                              {receita.recebido ? "Recebido" : "Pendente"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDayData.despesas.length === 0 && selectedDayData.receitas.length === 0 && (
                  <p className="text-muted-foreground">Nenhuma movimentação financeira neste dia.</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Selecione uma data no calendário para ver os detalhes.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};