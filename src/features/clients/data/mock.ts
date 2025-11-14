export type ClientType = 'Detran' | 'SMTR' | 'Ambos'

export type Client = {
  id: string
  nome: string
  documentType: 'CPF' | 'CNPJ'
  document: string
  placa: string
  tipo: ClientType
  veiculos: number
  vehicles?: Vehicle[]
  phone?: string
  birthDate?: string
  sex?: 'Masculino' | 'Feminino' | null
  permissionNumber?: string | null
  address?: {
    street: string
    city: string
    state: string
    zip: string
    complement?: string
  }
  cnh?: {
    registro: string
    expedicao: string
    validade: string
    uf: string
  }
}

export type Vehicle = {
  model: string
  plate: string
  lastLicensingYear: number
  chassis?: string
  renavam?: string
  year?: number
  modelYear?: number
  fuel?: string
  category?: string
  color?: string
  crv?: string | null
}

export const clientTypes: ClientType[] = ['Detran', 'SMTR', 'Ambos']

export const clientsMock: Client[] = [
  {
    id: '1',
    nome: 'Lucas Silva',
    documentType: 'CPF',
    document: '15512894706',
    placa: 'LUC-0A23',
    tipo: 'Detran',
    veiculos: 2,
    vehicles: [
      { model: 'FIAT ARGO', plate: 'ARX-5J11', lastLicensingYear: 2023, chassis: '9BFXARGO123456789', renavam: '005678901', year: 2018, modelYear: 2019, fuel: 'Flex', category: 'Particular', color: 'Prata', crv: 'CRV123456' },
      { model: 'CHEVROLET ONIX', plate: 'ONX-8P22', lastLicensingYear: 2022, chassis: '9BGONIX1234567890', renavam: '004567890', year: 2017, modelYear: 2018, fuel: 'Flex', category: 'Particular', color: 'Preto', crv: null }
    ],
    phone: '(21) 99999-9999',
    birthDate: '1999-09-09',
    sex: 'Masculino',
    permissionNumber: null,
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zip: '23085-600'
    },
    cnh: {
      registro: '01587625487954',
      expedicao: '2020-09-15',
      validade: '2024-09-15',
      uf: 'RJ'
    }
  },
  {
    id: '2',
    nome: 'Mariana Alves',
    documentType: 'CPF',
    document: '25564761758',
    placa: 'ABC-1234',
    tipo: 'SMTR',
    veiculos: 4,
    vehicles: [
      { model: 'VW GOL', plate: 'GLA-1A22', lastLicensingYear: 2024, chassis: '9BWZZZ377VT004251', renavam: '009998877', year: 2015, modelYear: 2016, fuel: 'Flex', category: 'Particular', color: 'Branco', crv: null },
      { model: 'RENAULT KWID', plate: 'KWD-2B33', lastLicensingYear: 2023 },
      { model: 'HYUNDAI HB20S', plate: 'HBS-5K77', lastLicensingYear: 2024 },
      { model: 'CHEVROLET PRISMA', plate: 'PRI-9M10', lastLicensingYear: 2022 }
    ],
    phone: '(21) 98811-2211',
    birthDate: '1992-01-10',
    sex: 'Feminino',
    permissionNumber: '123456',
    address: {
      street: 'Av. Brasil, 1000',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zip: '21040-000'
    },
    cnh: {
      registro: '01987625487954',
      expedicao: '2021-01-10',
      validade: '2026-01-10',
      uf: 'RJ'
    }
  },
  {
    id: '3',
    nome: 'Pedro Almeida',
    documentType: 'CPF',
    document: '35564761758',
    placa: 'XYZ-9B77',
    tipo: 'Detran',
    veiculos: 7,
    vehicles: [
      { model: 'FORD KA', plate: 'FKA-0A01', lastLicensingYear: 2024 },
      { model: 'FIAT UNO', plate: 'UNO-2Z34', lastLicensingYear: 2023 },
      { model: 'FIAT CRONOS', plate: 'CRN-9P12', lastLicensingYear: 2024 },
      { model: 'HONDA CIVIC', plate: 'CIV-7H65', lastLicensingYear: 2021 },
      { model: 'VW T-CROSS', plate: 'TCR-3K98', lastLicensingYear: 2024 },
      { model: 'TOYOTA COROLLA', plate: 'COR-1B55', lastLicensingYear: 2023 },
      { model: 'RENAULT DUSTER', plate: 'DST-6U88', lastLicensingYear: 2022 }
    ],
    phone: '(21) 98922-3344',
    birthDate: '1989-05-11',
    sex: 'Masculino',
    permissionNumber: null,
    address: { street: 'Rua A, 50', city: 'Niterói', state: 'RJ', zip: '24000-000' },
    cnh: { registro: '01234567890123', expedicao: '2019-05-11', validade: '2025-05-11', uf: 'RJ' }
  },
  {
    id: '4',
    nome: 'Rafael Costa',
    documentType: 'CPF',
    document: '45564761758',
    placa: 'JKL-3344',
    tipo: 'Detran',
    veiculos: 3,
    vehicles: [
      { model: 'NISSAN KICKS', plate: 'KCK-4G21', lastLicensingYear: 2024 },
      { model: 'HYUNDAI CRETA', plate: 'CRT-7J42', lastLicensingYear: 2023 },
      { model: 'FIAT PULSE', plate: 'PLS-2F09', lastLicensingYear: 2024 }
    ],
    phone: '(21) 99123-9988',
    birthDate: '1990-08-20',
    sex: 'Masculino',
    permissionNumber: '998877',
    address: { street: 'Rua das Laranjeiras, 200', city: 'Rio de Janeiro', state: 'RJ', zip: '22240-003' },
    cnh: { registro: '01999112223334', expedicao: '2020-08-20', validade: '2025-08-20', uf: 'RJ' }
  },
  {
    id: '5',
    nome: 'Juliana Ramos',
    documentType: 'CPF',
    document: '55564761758',
    placa: 'MNO-8877',
    tipo: 'Detran',
    veiculos: 1,
    phone: '(21) 98222-1111',
    birthDate: '1996-12-12',
    sex: 'Feminino',
    permissionNumber: null,
    address: { street: 'Rua B, 123', city: 'Duque de Caxias', state: 'RJ', zip: '25000-000' },
    cnh: { registro: '01112223334445', expedicao: '2022-02-02', validade: '2027-02-02', uf: 'RJ' }
  },
  {
    id: '6',
    nome: 'Eduardo Nogueira',
    documentType: 'CPF',
    document: '65564761758',
    placa: 'QRS-6621',
    tipo: 'SMTR',
    veiculos: 2,
    phone: '(21) 98333-2222',
    birthDate: '1988-03-08',
    sex: 'Masculino',
    permissionNumber: null,
    address: { street: 'Rua C, 321', city: 'São Gonçalo', state: 'RJ', zip: '24700-000' },
    cnh: { registro: '01765432123456', expedicao: '2018-03-08', validade: '2024-03-08', uf: 'RJ' }
  },
  {
    id: '7',
    nome: 'Auto Peças Prime Ltda',
    documentType: 'CNPJ',
    document: '12654789000177',
    placa: 'APP-5566',
    tipo: 'Detran',
    veiculos: 6,
    phone: '(21) 2200-1234',
    birthDate: '2008-01-01',
    sex: undefined,
    permissionNumber: '554433',
    address: { street: 'Rua do Mercado, 100', city: 'Rio de Janeiro', state: 'RJ', zip: '20010-120' }
  },
  {
    id: '8',
    nome: 'Priscila Mendonça',
    documentType: 'CPF',
    document: '22564761758',
    placa: 'PRI-5522',
    tipo: 'Detran',
    veiculos: 2,
    phone: '(21) 97111-3333',
    birthDate: '1995-07-07',
    sex: 'Feminino',
    permissionNumber: null,
    address: { street: 'Rua D, 20', city: 'Rio de Janeiro', state: 'RJ', zip: '20000-000' },
    cnh: { registro: '01654321987654', expedicao: '2021-07-07', validade: '2026-07-07', uf: 'RJ' }
  },
  {
    id: '9',
    nome: 'Ana Silva',
    documentType: 'CPF',
    document: '30564761758',
    placa: 'ANA-1111',
    tipo: 'Ambos',
    veiculos: 1,
    phone: '(21) 97222-4444',
    birthDate: '1993-09-09',
    sex: 'Feminino',
    permissionNumber: null,
    address: { street: 'Rua E, 10', city: 'Rio de Janeiro', state: 'RJ', zip: '21999-000' },
    cnh: { registro: '01555555555555', expedicao: '2020-09-09', validade: '2025-09-09', uf: 'RJ' }
  },
  {
    id: '10',
    nome: 'Bruno Santos',
    documentType: 'CPF',
    document: '40564761758',
    placa: 'BRU-2222',
    tipo: 'SMTR',
    veiculos: 3,
    phone: '(21) 97333-5555',
    birthDate: '1991-11-11',
    sex: 'Masculino',
    permissionNumber: '777888',
    address: { street: 'Rua F, 45', city: 'Rio de Janeiro', state: 'RJ', zip: '21345-000' },
    cnh: { registro: '01444444444444', expedicao: '2019-11-11', validade: '2024-11-11', uf: 'RJ' }
  },
  {
    id: '11',
    nome: 'Carla Pereira',
    documentType: 'CPF',
    document: '50564761758',
    placa: 'CAR-3333',
    tipo: 'Detran',
    veiculos: 4,
    phone: '(21) 97444-6666',
    birthDate: '1997-06-15',
    sex: 'Feminino',
    permissionNumber: null,
    address: { street: 'Rua G, 80', city: 'Rio de Janeiro', state: 'RJ', zip: '21000-111' },
    cnh: { registro: '01333333333333', expedicao: '2022-06-15', validade: '2027-06-15', uf: 'RJ' }
  },
  {
    id: '12',
    nome: 'Oficina Mendes ME',
    documentType: 'CNPJ',
    document: '14654789000133',
    placa: 'OFM-9988',
    tipo: 'SMTR',
    veiculos: 5,
    phone: '(21) 3333-4444',
    birthDate: '2012-05-05',
    sex: undefined,
    permissionNumber: '112233',
    address: { street: 'Rua H, 77', city: 'Rio de Janeiro', state: 'RJ', zip: '21011-222' }
  },
  {
    id: '13',
    nome: 'Diego Rocha',
    documentType: 'CPF',
    document: '60564761758',
    placa: 'DIE-4444',
    tipo: 'Detran',
    veiculos: 1,
    phone: '(21) 97555-7777',
    birthDate: '1990-01-30',
    sex: 'Masculino',
    permissionNumber: null,
    address: { street: 'Rua I, 99', city: 'Rio de Janeiro', state: 'RJ', zip: '21888-333' },
    cnh: { registro: '01222222222222', expedicao: '2018-01-30', validade: '2023-01-30', uf: 'RJ' }
  },
  {
    id: '14',
    nome: 'TransLog Transportes Eireli',
    documentType: 'CNPJ',
    document: '19654789000144',
    placa: 'TLT-1200',
    tipo: 'Ambos',
    veiculos: 12,
    phone: '(21) 4002-8922',
    birthDate: '2015-10-10',
    sex: undefined,
    permissionNumber: null,
    address: { street: 'Av. Brasil, 5000', city: 'Rio de Janeiro', state: 'RJ', zip: '21050-000' }
  }
]
