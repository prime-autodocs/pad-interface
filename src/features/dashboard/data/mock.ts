export const summaryCards = [
  {
    id: 'clientes',
    label: 'CLIENTES CADASTRADOS',
    value: 405,
    icon: '/src/assets/icons/summary/users.png',
    accent: '#111214',
    numberColor: '#111214',
    labelColor: '#111214'
  },
  {
    id: 'veiculos',
    label: 'VEÍCULOS CADASTRADOS',
    value: 203,
    icon: '/src/assets/icons/summary/car.png',
    accent: '#0a9fa9',
    numberColor: '#0a9fa9',
    labelColor: '#0a9fa9'
  },
  {
    id: 'novos_clientes',
    label: 'NOVOS CLIENTES',
    value: 102,
    icon: '/src/assets/icons/summary/new-clients.png',
    accent: '#14e0d4',
    numberColor: '#14e0d4',
    labelColor: '#14e0d4'
  },
  {
    id: 'servicos',
    label: 'SERVIÇOS REALIZADOS',
    value: 5,
    icon: '/src/assets/icons/summary/services.png',
    accent: '#0a9fa9',
    numberColor: '#0a9fa9',
    labelColor: '#0a9fa9'
  }
]

export const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export const novosClientesMensal = [20,12,15,40,12,28,9,2,19,21,16,8]
export const servicosRealizadosMensal = [20,12,15,40,0,28,9,2,16,20,13,7]

export const quarters = ['1° Quarter','2° Quarter','3° Quarter','4° Quarter']
export const novosClientesTrimestral = [47,51,30,33]
export const servicosRealizadosTrimestral = [47,39,27,33]

export const years = [2021, 2022, 2023, 2024, 2025]
export const novosClientesAnual = [210, 260, 300, 280, 320]
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


