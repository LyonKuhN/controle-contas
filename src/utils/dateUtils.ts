
// Utility para formatar datas sem problemas de timezone
export const formatDateFromString = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR');
};

export const formatDateToInput = (dateString: string): string => {
  return dateString; // Retorna no formato YYYY-MM-DD para inputs
};
