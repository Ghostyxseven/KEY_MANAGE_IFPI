# CoreTech — KEY_MANAGE_IFPI

Sistema mobile offline-first desenvolvido para digitalizar o controle de retirada e devolução de chaves de salas e laboratórios do IFPI – Campus Piripiri.

O projeto surgiu a partir da identificação de problemas no processo manual atualmente utilizado na guarita do campus, como:
- transcrição manual entre turnos;
- inconsistência nos registros;
- dificuldade de rastreabilidade;
- dependência de caderno físico;
- falhas operacionais durante quedas de internet.

---

# Objetivo do Projeto

Desenvolver um MVP funcional capaz de:
- registrar retirada de chaves;
- registrar devolução;
- exibir status das chaves em tempo real;
- funcionar mesmo sem internet;
- sincronizar os registros posteriormente com o servidor central.

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
├── docs/              # Documentação do projeto
├── frontend/          # Aplicação mobile
├── backend/           # API e regras de negócio
├── wireframes/        # Fluxos e telas
├── meetings/          # Atas e registros de reunião
├── README.md
└── .gitignore

Organização da Equipe
Membro	Função
Wesley Tiago	Scrum Master
Antônio Carlos	Product Owner
Ana Rosa	    Documentação e requisitos
Eric Vinicius	UX/UI
Roger Pierre	Backend
Nilson Rodrigo	Frontend

Metodologia

O projeto utiliza:

Scrum
Kanban
GitHub Projects
Versionamento com Git
Organização das Branches

Cada integrante trabalha em sua própria branch.

Exemplo
main
develop
feature_WesleySM
feature_EricUI
feature_RogerBackend
Fluxo de Trabalho
Atualizar repositório
git pull origin main
Criar ou acessar branch
git checkout feature_nome
Adicionar alterações
git add .
Criar commit
git commit -m "feat: descrição da alteração"
Enviar para GitHub
git push origin feature_nome
Abrir Pull Request
Organização do Kanban
Backlog

Ideias futuras e funcionalidades pós-MVP.

A Fazer

Tarefas da sprint atual.

Fazendo

Tarefas em desenvolvimento.

Em Revisão

Aguardando validação da equipe.

Feito

Tarefas concluídas.

Documentação

Os documentos do projeto estão disponíveis em:

/docs

Incluindo:

Relatório de Viabilidade de Software (RVS)
Documento de Requisitos
Matriz de riscos
Fluxos principais
Wireframes
Planejamento do MVP
Estado Atual do Projeto
Concluído
RVS
Documento preliminar de requisitos
Fluxos principais
Wireframes iniciais
Levantamento de stakeholders
Matriz de riscos
Em andamento
Organização do backlog
Estrutura inicial do repositório
Planejamento técnico do MVP
Observações

Este projeto possui caráter acadêmico e está sendo desenvolvido na disciplina de Engenharia de Software II do curso de Análise e Desenvolvimento de Sistemas do IFPI – Campus Piripiri.

O foco atual é a construção de um MVP funcional e validável, priorizando simplicidade, viabilidade técnica e aderência ao contexto operacional do campus.