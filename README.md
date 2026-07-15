# CoreTech — Sistema de Gerenciamento de Acesso a Chaves

Sistema mobile offline-first desenvolvido para digitalizar o controle de retirada e devolução de chaves de salas e laboratórios do IFPI – Campus Piripiri.

## Estado do Projeto

Este repositório contém o **MVP completo** do projeto CoreTech, incluindo:
- **PRD** — Documento de Requisitos de Produto.
- **Specs** — Contratos OpenAPI + Schemas Zod.
- **Harness** — Lint + Typecheck + Testes de Contrato automatizados.
- **Código-fonte** — Implementação TypeScript seguindo SDD (Spec-Driven Development).
- **Firebase** — Configuração de Firestore + Cloud Functions + Hosting.

## Problema Resolvido

O controle manual de chaves na guarita do IFPI Campus Piripiri causa:
- Transcrição manual entre turnos (25-30 min por troca).
- Erros humanos e rasuras nos registros.
- Falta de rastreabilidade e inconsistências.
- Dependência de caderno físico e internet.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend mobile | React Native + Expo + TypeScript |
| Backend / API | Firebase Cloud Functions (Node.js) |
| Banco de dados | Firebase Cloud Firestore |
| Cache local / Offline | Firestore SDK native cache |
| Hospedagem | Firebase Hosting |
| Validação | Zod (runtime schemas) |
| Testes | Vitest |
| Lint | ESLint + TypeScript ESLint |

## Estrutura do Repositório

```
C:\KEY_MANAGE_IFPI\
├── docs/                          # Documentacao (PRD, ERS, RVS, ADRs, Harness)
├── src/
│   ├── specs/                     # Contratos travados (OpenAPI + Zod)
│   │   ├── openapi.yaml
│   │   ├── schemas/
│   │   │   ├── chaves.schema.ts
│   │   │   ├── common.schema.ts
│   │   │   ├── identificacao.schema.ts
│   │   │   └── sync.schema.ts
│   ├── core/                      # Nucleo (interfaces, tipos, repositories)
│   │   ├── interfaces/index.ts
│   │   ├── types/index.ts
│   │   └── repositories/firestore.repository.ts
│   ├── features/
│   │   ├── chaves/                # Feature: gestao de chaves
│   │   │   ├── chaves.service.ts
│   │   │   └── strategies/
│   │   │       ├── checkout.strategy.ts
│   │   │       └── return.strategy.ts
│   │   └── sync/                  # Feature: sincronizacao
│   │       └── sync.service.ts
│   ├── api/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   └── index.ts                   # Entry point (Express + Firebase)
├── tests/
│   └── contracts/
│       ├── chaves.contract.test.ts
│       └── sync.contract.test.ts
├── firebase.json
├── firestore.rules
├── .firebaserc
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
└── .github/workflows/ci.yml
```

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- Conta Firebase (projeto `coretech-chaves`)
- Firebase CLI: `npm install -g firebase-tools`

## Instalação e Configuração

```bash
# 1. Clonar o repositório
git clone https://github.com/CoreTech-IFPI/coretech-chaves.git
cd coretech-chaves

# 2. Instalar dependencias
npm install

# 3. Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com as credenciais do Firebase:
# FIREBASE_PROJECT_ID=coretech-chaves
# FIREBASE_CLIENT_EMAIL=...
# FIREBASE_PRIVATE_KEY=...

# 4. Login no Firebase
firebase login
firebase use --add
```

## Executando o Projeto

### Backend — API + Firebase
```bash
# 1. Clonar o repositório
git clone https://github.com/CoreTech-IFPI/coretech-chaves.git
cd coretech-chaves

# 2. Instalar dependencias
npm install

# 3. Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com as credenciais do Firebase:
# FIREBASE_PROJECT_ID=coretech-chaves
# FIREBASE_CLIENT_EMAIL=...
# FIREBASE_PRIVATE_KEY=...

# 4. Login no Firebase
firebase login
firebase use --add

# 5. Iniciar API local
npm run dev
```

A API estará disponível em `http://localhost:3001/v1`.

### Frontend — App Expo (mobile)
```bash
cd frontend

# Windows — use o script preparado
start.bat

# macOS/Linux
export TEMP="$HOME/.cache"
export TMP="$HOME/.cache"
npx expo start
```

Escaneie o QR code com o **Expo Go** (Android/iOS). O app consome a API em `http://<SEU_IP>:3001/v1`.

### Apenas o servidor API
```bash
npm run dev
```

### Build para produção
```bash
npm run build
npm start
```

## Executando o Harness (Verificação Automática)

O Harness executa três sensores em sequência:

```bash
npm run verify
# = npm run lint && npm run typecheck && npm run test
```

| Sensor | Comando | O que valida |
|--------|---------|--------------|
| Lint | `npm run lint` | Estilo, anti-padrões estruturais, imports proibidos. |
| Typecheck | `npm run typecheck` | Contratos de tipos, campos obrigatórios. |
| Testes | `npm run test` | Regras de negócio (RN01, RN05, RN07). |

### Testes individuais
```bash
npm run test              # Executa todos os testes
npm run test:watch        # Modo watch para desenvolvimento
```

## Endpoints da API

| Método | Rota | Descrição | RF/RN |
|--------|------|-----------|-------|
| POST | `/v1/identificacao` | Registrar identificacao do guarda | RF01, RN02 |
| GET | `/v1/chaves` | Listar quadro virtual de chaves | RF02, RF03 |
| GET | `/v1/chaves/{codigo}` | Consultar detalhes de uma chave | RF02, RF03, RN04 |
| GET | `/v1/chaves/{codigo}/historico` | Consultar historico de movimentacoes | RF09 |
| POST | `/v1/chaves/{codigo}/retirada` | Registrar retirada de chave | RF04, RF05, RN01 |
| POST | `/v1/chaves/{codigo}/devolucao` | Registrar devolucao de chave | RF06, RN05 |
| POST | `/v1/sync` | Sincronizar lote de registros pendentes | RF07, RF08, RN07 |

## Documentação Adicional

- [PRD](docs/PRD.md) — Product Requirement Document.
- [ERS](docs/ERS.md) — Especificação de Requisitos de Software.
- [RVS](docs/RVS.md) — Relatório de Viabilidade de Software.
- [REQS_HIERARCHY](docs/REQS_HIERARCHY.md) — Backlog e rastreabilidade.
- [ADR 0010](docs/architecture/decisions/0010-substituicao-do-postgresql-pelo-firebase-firestore.md) — Substituição de PostgreSQL por Firestore.
- [ADR 0011](docs/architecture/decisions/0011-adocao-do-firebase-como-hospedagem.md) — Adoção do Firebase como hospedagem.
- [ADR 0012](docs/architecture/decisions/0012-estrategia-de-sincronizacao-offline-firestore.md) — Sincronização offline via Firestore.
- [Harness](docs/harness/HARNESS.md) — Documentação do AI Harness.

## Critérios de Aceitação do MVP

- [x] PRD alinha visão de negócio e escopo técnico.
- [x] Specs (OpenAPI + Zod) travadas antes da implementação.
- [x] Código implementado via SDD, sem divergência das specs.
- [x] Harness operacional: lint + typecheck + testes de contrato passam.
- [x] RN01 bloqueia retirada duplicada (HTTP 409).
- [x] RN05 bloqueia devolução de chave já disponível (HTTP 409).
- [x] RN07 aplica LWW na sincronização.
- [x] Firebase configurado (Firestore + Cloud Functions + Hosting).
- [x] CI/CD rodando `npm run verify` em todo Pull Request.

## Equipe

| Integrante | Função |
|------------|--------|
| Wesley Tiago | Scrum Master |
| Antônio Carlos | Product Owner |
| Ana Rosa Pereira Chaves | Analista de Requisitos |
| Eric Vinicius | UX/UI |
| Roger Pierre | Desenvolvedor Full Stack |
| Nilson Rodrigo | Desenvolvedor Full Stack |

---

*Projeto acadêmico — Engenharia de Software II — IFPI Campus Piripiri — Professor Mayllon Veras*
