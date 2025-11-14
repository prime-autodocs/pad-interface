## PrimeAutoDocs

Aplicativo web de gerenciamento de clientes, veículos e processos para despachante documentalista. Construído com React, TypeScript e Vite, priorizando UX, performance e uma base de código organizada e escalável.


### Sumário
- Visão Geral
- Principais Funcionalidades
- Stack e Decisões
- Estrutura de Pastas
- Começando
- Scripts Disponíveis
- Convenções de Código e UI
- Roteamento
- Fluxos Implementados
  - Login
  - Dashboard
  - Relatório de Clientes
  - Cadastro de Cliente
  - Cadastro de Veículo
- Mocks e Serviços
- Estilos e Responsividade
- Boas Práticas
- Roadmap (próximos passos)


### Visão Geral
O PrimeAutoDocs foi planejado para centralizar operações comuns de um despachante: cadastro de clientes, gerenciamento de veículos, emissão de documentos e acompanhamento de processos. Enquanto a API oficial não está disponível, a aplicação utiliza dados mockados e chamadas fake para demonstrar o funcionamento end-to-end.


### Principais Funcionalidades
- Autenticação simulada e guarda de rotas.
- Dashboard com cartões, gráficos e lista de atividades em andamento.
- Relatório de clientes com busca reativa (nome, CPF/CNPJ, placa), filtros e responsividade.
- Drawer de detalhes de cliente, modal de veículos e drawer de detalhes de veículo.
- Cadastro de cliente multi‑etapas (dados pessoais, documentos, endereço, sucesso) com validação e ViaCEP.
- Cadastro de veículo em 2 etapas com validações, resumo/confirmar, upload de imagem e tela de sucesso.


### Stack e Decisões
- Vite + React + TypeScript
- React Router DOM (roteamento/guards)
- Context API (estado entre passos de formulários)
- CSS Modules (isolamento de estilos e responsividade)
- Chart.js + react-chartjs-2 (gráficos do dashboard)
- fetch (nativo) para chamadas mockadas/fake

Decisões chave:
- Componentização e pastas por domínio em `src/features/*`.
- Estilos modulares por página/componente com variáveis de tema em `src/styles`.
- Mock de dados por domínio para desenvolvimento incremental.


### Estrutura de Pastas
```
src/
  app/
    guards/RequireAuth.tsx
    layouts/AppLayout.tsx
  assets/ (imagens/ícones/fontes)
  components/ (UI reutilizável, formulários, feedback, etc.)
  features/
    auth/
    dashboard/
    clients/
      data/mock.ts
      pages/ClientsReportPage.tsx
      components/(drawers e modais)
      pages/register/ClientRegisterPage.tsx
    vehicles/
      pages/NewVehiclePage.tsx
      context/VehicleRegisterContext.tsx
  styles/
    globals/
    theme/
  services/ (auth mock, http, storage)
  main.tsx (entrada e rotas)
```


### Começando
Pré‑requisitos:
- Node 18+ recomendado
- npm 9+ ou pnpm/yarn

Instalação e execução:
```bash
npm install
npm run dev
```

Build e preview:
```bash
npm run build
npm run preview
```


### Scripts Disponíveis
- `dev`: ambiente de desenvolvimento (Vite)
- `build`: build de produção
- `preview`: serve local do build gerado


### Convenções de Código e UI
- TypeScript estrito para componentes, props e serviços públicos.
- Nomes descritivos para variáveis e funções (Clean Code).
- Evitar comentários óbvios; comentar apenas o que é essencial.
- CSS Modules por página/componente; responsividade mobile‑first.
- Botões/inputs padronizados (`components/ui`, `components/form`) quando aplicável.


### Roteamento
Definido em `src/main.tsx`:
- `/login` (público)
- `/dashboard` (protegido)
- `/relatorio-clientes` (protegido)
- `/clientes` (protegido – quando aplicável)
- `/veiculos` (protegido) – cadastro de veículo

Rotas protegidas usam `RequireAuth` e layout global `AppLayout` (com Sidebar e título dinâmico).


### Fluxos Implementados

1) Login
- Tela com validação simples (mockAuth: usuário `teste`, senha `teste`).
- Redireciona para o Dashboard ao logar.

2) Dashboard
- Cards com métricas, gráficos (barras e doughnut), e “Pedidos em Andamento” com layout responsivo.
- Alternância mensal/trimestral/anual e ajustes visuais para não quebrar layout.

3) Relatório de Clientes
- Tabela com busca reativa (a partir de 3 caracteres) por nome, CPF/CNPJ e placa.
- Máscara de CPF/CNPJ na exibição.
- Modal de veículos e Drawer de detalhes de veículo (z‑index e responsividade ajustados).
- Drawer de detalhes do cliente com verificação de validade da CNH e link “ver no mapa” (Google Maps).

4) Cadastro de Cliente
- Form multi‑etapas com Context API, validações, ViaCEP e preview de imagens.
- Sucesso com imagem e botão “Cadastrar novo cliente” que reseta o fluxo.

5) Cadastro de Veículo (`/veiculos`)
- Etapa 1 – Seleção de cliente: busca por Nome/CPF/CNPJ; dropdown com resultados; seleção salva no contexto.
- Etapa 2 – Documentos: campos do veículo e painel de imagens no mesmo card.
  - Campos somente leitura do cliente (Documento e Nome) no topo.
  - Upload com preview (mantido no contexto como `docPhotoUrl`).
  - Validações:
    - Marca/Modelo/Chassi: obrigatórios
    - Placa (Mercosul): padrão `ABC1D23`
    - Renavam: opcional (valida 11 dígitos se preenchido)
    - Ano/Modelo: obrigatórios, seleção por dropdown (1980 → próximo ano)
    - Cor/CRV: opcionais
    - Combustível: dropdown (Gasolina, Alcool, Gas/Gasolina, Gas/Alcool, Eletrico, Diesel, Gasolina/Alcool)
    - Categoria: dropdown (Particular, Aluguel)
  - Resumo/Confirmação em modal antes do envio.
  - Envio fake (`POST https://jsonplaceholder.typicode.com/posts`) com payload `{ client, vehicle }`.
  - Sucesso com:
    - “Cadastrar Novo Veículo”: retorna para etapa 2, mantendo o mesmo cliente e limpando os campos do veículo.
    - “Ir para Relatório de Clientes”: navega para `/relatorio-clientes`.


### Mocks e Serviços
- Mocks por domínio em `src/features/*/data/mock.ts`.
- Autenticação mock em `src/services/auth/mockAuth.ts`.
- Enquanto a API real não está pronta, endpoints fake são usados para requests de demonstração (ex.: JSONPlaceholder).


### Estilos e Responsividade
- Variáveis de tema em `src/styles/theme/variables.css`.
- Estilos globais em `src/styles/globals` (tipografia, base e resets).
- CSS Modules por página/componente com breakpoints focados em mobile‑first.
- Drawer/Modal com `z-index` controlado para hierarquia correta.


### Boas Práticas
- Reutilizar componentes de UI e padrões de layout existentes.
- Extrair regras de validação/padronização para funções utilitárias quando fizer sentido.
- Manter o estado global apenas para o que precisa sobreviver entre telas/etapas.
- Evitar dependências desnecessárias e sobrecarga de estilo.


### Roadmap (próximos passos)
- Integração com API real (auth, clientes, veículos, processos).
- Máscaras e validações extra (ex.: chassi/placa completos por região, CRV).
- Testes unitários (React Testing Library / Vitest) e e2e (Playwright).
- Tabela do relatório com ordenação/colunas configuráveis/export.
- Upload real com progresso e armazenamento em CDN/S3.
- Perfis de usuário, permissões e auditoria.


### Suporte
Encontrou um problema ou quer sugerir algo? Abra uma issue ou descreva no chat do projeto.

