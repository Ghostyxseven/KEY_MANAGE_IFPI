# CoreTech — Sistema de Gerenciamento de Acesso a Chaves

Sistema mobile offline-first desenvolvido para digitalizar o controle de retirada e devolução de chaves de salas e laboratórios do IFPI – Campus Piripiri.

O projeto surgiu a partir da identificação de problemas no processo manual atualmente utilizado na guarita do campus, como:

- Transcrição manual entre turnos
- Inconsistência nos registros
- Dificuldade de rastreabilidade
- Dependência de caderno físico
- Falhas operacionais durante quedas de internet

---

# Objetivo do Projeto

Desenvolver um MVP funcional capaz de:

- Registrar retirada de chaves
- Registrar devolução
- Exibir status das chaves em tempo real
- Funcionar mesmo sem internet
- Sincronizar os registros posteriormente com o servidor central

---

# Escopo do MVP

## Funcionalidades incluídas

- Autenticação por nome e matrícula
- Quadro virtual de chaves
- Indicadores visuais de status
- Registro de retirada
- Registro de devolução
- Armazenamento offline local
- Sincronização básica de dados

## Funcionalidades pós-MVP

- Dashboard gerencial
- Relatórios históricos
- Notificações
- Perfis de acesso
- Gestão administrativa
- QR Code para identificação de chaves

---

# Stack Tecnológica

## Frontend

- React Native
- Expo
- TypeScript

## Backend

- Node.js
- Express

## Banco de Dados

- SQLite (offline/local)
- PostgreSQL (servidor)

---

# Estrutura do Projeto

```txt
coretech-chave-access/
│
├── docs/              
├── frontend/          
├── backend/           
├── wireframes/        
├── meetings/          
├── README.md
└── .gitignore
```

### Descrição das pastas

| Pasta | Descrição |
|---|---|
| `/docs` | Documentação do projeto |
| `/frontend` | Aplicação mobile |
| `/backend` | API e regras de negócio |
| `/wireframes` | Fluxos, desenhos e protótipos |
| `/meetings` | Atas e registros de reunião |

---

# Integrantes da Equipe

| Integrante | Função |
|---|---|
| Wesley Tiago | Scrum Master |
| Antônio Carlos | Product Owner |
| Ana Rosa | Documentação e requisitos |
| Eric Vinicius | UX/UI |
| Roger Pierre | Backend |
| Nilson Rodrigo | Frontend |

---

# Metodologia

O projeto utiliza:

- Scrum
- Kanban
- GitHub Projects
- Versionamento com Git

---

# Organização das Branches

Cada integrante trabalha em sua própria branch.

## Exemplo

```txt
main
develop
feature_WesleySM
feature_EricUI
feature_RogerBackend
```

---

# Fluxo de Trabalho

## 1. Atualizar repositório

```bash
git pull origin main
```

## 2. Criar ou acessar branch

```bash
git checkout feature_nome
```

## 3. Adicionar alterações

```bash
git add .
```

## 4. Criar commit

```bash
git commit -m "feat: descrição da alteração"
```

## 5. Enviar para GitHub

```bash
git push origin feature_nome
```

## 6. Abrir Pull Request

Após finalizar uma funcionalidade, abrir um Pull Request para revisão da equipe.

---

# Organização do Kanban

| Coluna | Objetivo |
|---|---|
| Backlog | Ideias futuras e funcionalidades pós-MVP |
| A Fazer | Tarefas da sprint atual |
| Fazendo | Tarefas em desenvolvimento |
| Em Revisão | Aguardando validação da equipe |
| Feito | Tarefas concluídas |

---

# Documentação

Os documentos do projeto estão disponíveis em:

```txt
/docs
```

## Documentos atuais

- Relatório de Viabilidade de Software (RVS)
- Documento preliminar de requisitos
- Matriz de riscos
- Fluxos principais
- Wireframes
- Planejamento do MVP

---

# Estado Atual do Projeto

## Concluído

- RVS
- Documento preliminar de requisitos
- Fluxos principais
- Wireframes iniciais
- Levantamento de stakeholders
- Matriz de riscos

## Em andamento

- Organização do backlog
- Estrutura inicial do repositório
- Planejamento técnico do MVP

---

# Observações

Este projeto possui caráter acadêmico e está sendo desenvolvido na disciplina de Engenharia de Software II do curso de Análise e Desenvolvimento de Sistemas do IFPI – Campus Piripiri.

O foco atual é a construção de um MVP funcional e validável, priorizando simplicidade, viabilidade técnica e aderência ao contexto operacional do campus.
