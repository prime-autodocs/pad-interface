// summaryCards mock removido em favor de dados de API

export const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export const servicosRealizadosMensal = [20,12,15,40,0,28,9,2,16,20,13,7]

export const quarters = ['1° Trimestre','2° Trimestre','3° Trimestre','4° Trimestre']
export const servicosRealizadosTrimestral = [47,39,27,33]

export const years = [2021, 2022, 2023, 2024, 2025]
export const servicosRealizadosAnual = [180, 240, 310, 270, 295]

export const situacaoVistorias = [
  { label: 'Veículos Vistoriados', value: 70 },
  { label: 'Veículos sem Vistoria', value: 30 }
]

export const situacaoCnh = [
  { label: 'CNH ativas', value: 10 },
  { label: 'CNH a vencer', value: 28.7 },
  { label: 'CNH vencidas', value: 6.9 }
]

export const pedidosEmAndamento = [
  // 10 totais: 1 aberto, 6 em progresso, 2 atrasados, 1 completo
  { id: 1, titulo: 'Vistoria Detran', cliente: 'Ana Silva', status: 'Aberto' },
  { id: 2, titulo: 'Vistoria SMTR', cliente: 'Bruno Santos', status: 'Em Progresso' },
  { id: 3, titulo: 'Emissão de Documentos', cliente: 'Carla Pereira', status: 'Em Progresso' },
  { id: 4, titulo: 'Recurso de Multa', cliente: 'Diego Rocha', status: 'Em Progresso' },
  { id: 5, titulo: 'Transferência de Propriedade', cliente: 'Eduarda Lima', status: 'Em Progresso' },
  { id: 6, titulo: '2ª Via CRV', cliente: 'Felipe Matos', status: 'Em Progresso' },
  { id: 7, titulo: 'Baixa de Gravame', cliente: 'Gabriela Souza', status: 'Em Progresso' },
  { id: 8, titulo: 'Liberação de Documento', cliente: 'Hugo Martins', status: 'Atrasado' },
  { id: 9, titulo: 'Agendamento de Vistoria', cliente: 'Isabela Pires', status: 'Atrasado' },
  { id: 10, titulo: 'Pagamento de Taxas', cliente: 'João Silva', status: 'Completo' }
]


