# Modelagem: Do Épico à Tarefa — Backlog do MVP com Rastreabilidade

## Sistema de Gerenciamento de Acesso a Chaves de Salas e Laboratórios

| Informação             | Descrição                                      |
| ---------------------- | ---------------------------------------------- |
| Instituição            | IFPI — Campus Piripiri                         |
| Disciplina             | Engenharia de Software II                      |
| Professor              | Mayllon Veras                                  |
| Equipe                 | CoreTech                                       |
| Scrum Master           | Wesley Tiago                                   |
| Product Owner          | Antonio Carlos                                 |
| Analista de Requisitos | Ana Rosa Pereira Chaves                        |
| UX/UI                  | Eric Vinicius                                  |
| Desenvolvedores        | Roger Pierre e Nilson Rodrigo                  |

---

## 1. Visão Geral do MVP

O IFPI Campus Piripiri realiza o controle de chaves de salas e laboratórios por meio de um caderno físico na guarita. O guarda registra nome e matrícula do responsável a cada retirada e, na troca de turno, transcreve manualmente as chaves ainda não devolvidas. Esse processo consome entre 25 e 30 minutos por troca de turno.

O MVP da CoreTech é uma aplicação mobile offline-first que digitaliza esse fluxo. O sistema deverá permitir:

* identificação por nome e matrícula;
* visualização do quadro de chaves com status por cor;
* registro de retirada;
* registro de devolução;
* operação offline;
* sincronização automática quando a conexão for restaurada.

### Stack Tecnológica Prevista

| Componente          | Tecnologia            |
| ------------------- | --------------------- |
| Aplicativo mobile   | React Native com Expo |
| API                 | Node.js com Express   |
| Armazenamento local | SQLite                |
| Banco central       | PostgreSQL            |

---

## 2. Épicos Principais do MVP

## Épico 1 — Identificação e Rastreabilidade

Permitir que o guarda identifique o responsável por nome e matrícula, garantindo rastreabilidade das operações sem uso de senhas complexas ou perfis diferenciados no MVP.

**Requisitos relacionados:** RF01, RF04, RF09 e RN02.

> A substituição administrativa da assinatura física pelo registro digital permanece pendente de validação institucional, conforme ressalva registrada no RVS e no ERS revisado.

## Épico 2 — Gestão de Retirada e Devolução de Chaves

Digitalizar o fluxo central de retirada e devolução de chaves, com quadro visual de status, indicadores de cor e bloqueio de operações inconsistentes.

**Requisitos relacionados:** RF02, RF03, RF04, RF05, RF06, RF09, RN01, RN03, RN04, RN05 e RN06.

## Épico 3 — Operação Offline e Sincronização com Servidor

Garantir que o aplicativo funcione durante quedas de internet, armazenando registros em SQLite e sincronizando-os com PostgreSQL quando a conexão for restaurada.

**Requisitos relacionados:** RF07, RF08, RF10, RN07, RNF03, RNF05, RNF06 e RNF08.

---

## 3. Histórias de Usuário

## Épico 1 — Identificação e Rastreabilidade

### US-01 — Identificação no Aplicativo

**Como** guarda de segurança,
**quero** me identificar no aplicativo informando nome e matrícula,
**para que** minhas operações fiquem registradas de forma rastreável sem necessidade de senha complexa.

#### Critérios de Aceite

* O campo nome completo deve ser obrigatório.
* O campo matrícula deve ser obrigatório.
* O sistema deve exibir mensagem de erro caso algum campo obrigatório esteja vazio.
* Após identificação válida, o sistema deve exibir o quadro de chaves.
* A identificação deve funcionar em modo offline.

### US-02 — Manutenção da Identificação Durante a Sessão

**Como** guarda de segurança,
**quero** que o sistema mantenha minha identificação durante a sessão,
**para que** eu não precise repetir os dados em cada operação do mesmo turno.

#### Critérios de Aceite

* Nome e matrícula devem permanecer associados à sessão ativa.
* Cada operação deve utilizar automaticamente os dados da sessão.
* Ao encerrar e reabrir o aplicativo, o sistema deverá solicitar nova identificação.
* O comportamento deve funcionar offline.

### US-03 — Registro do Responsável pela Retirada

**Como** guarda de segurança,
**quero** registrar nome e matrícula do responsável pela retirada,
**para que** cada operação possua rastreabilidade.

#### Critérios de Aceite

* Toda retirada deve registrar nome e matrícula.
* Não deve ser possível registrar retirada sem identificação do responsável.
* O registro deve incluir data e hora local do dispositivo.
* O histórico local deve permanecer disponível offline.

---

## Épico 2 — Gestão de Retirada e Devolução de Chaves

### US-04 — Visualização do Quadro de Chaves

**Como** guarda de segurança,
**quero** visualizar as chaves com indicadores de cor,
**para que** eu saiba imediatamente quais estão disponíveis ou em uso.

#### Critérios de Aceite

* O quadro deve exibir as chaves cadastradas com seus códigos.
* Chaves disponíveis devem aparecer em verde.
* Chaves em uso devem aparecer em vermelho.
* O quadro deve carregar com dados locais em modo offline.
* O status deve ser atualizado após retirada ou devolução.

### US-05 — Registro de Retirada

**Como** guarda de segurança,
**quero** registrar a retirada de uma chave em poucos toques,
**para que** o processo seja mais rápido que o registro manual.

#### Critérios de Aceite

* O fluxo principal deverá ser concluído em no máximo 3 toques.
* O sistema deve exibir confirmação antes de concluir a retirada.
* Após a confirmação, o status deve mudar para **Em uso**.
* O registro deve ser salvo localmente mesmo sem internet.
* O sistema deve impedir retirada de chave já em uso.

### US-06 — Registro de Devolução

**Como** guarda de segurança,
**quero** registrar a devolução de uma chave,
**para que** ela volte a ficar disponível para nova retirada.

#### Critérios de Aceite

* Ao selecionar uma chave em uso, o sistema deve oferecer a opção de devolução.
* Após confirmação, o status deve mudar para **Disponível**.
* O horário da devolução deve ser registrado.
* Não deve ser possível devolver uma chave já disponível.
* A operação deve funcionar offline.

### US-07 — Bloqueio de Retirada Indevida

**Como** guarda de segurança,
**quero** ser impedido de retirar uma chave já em uso,
**para que** o controle permaneça consistente.

#### Critérios de Aceite

* O sistema deve informar que a chave já está em uso.
* Nenhum novo registro de retirada deve ser criado nessa situação.
* O bloqueio deve funcionar mesmo sem internet.

---

## Épico 3 — Operação Offline e Sincronização com Servidor

### US-08 — Operação Offline

**Como** guarda de segurança,
**quero** que o aplicativo funcione quando a internet cair,
**para que** eu não precise retornar ao caderno físico.

#### Critérios de Aceite

* Retirada, devolução e visualização devem operar offline.
* Registros devem ser armazenados localmente em SQLite.
* O quadro de chaves deve utilizar os dados locais durante a indisponibilidade de rede.
* O aplicativo deve indicar que está operando offline.

### US-09 — Sincronização Automática Offline para Servidor

**Como** guarda de segurança,
**quero** que registros feitos offline sejam sincronizados quando a internet retornar,
**para que** eu não precise transcrevê-los manualmente depois.

#### Critérios de Aceite

* O sistema deve detectar a restauração da conexão.
* Registros pendentes devem ser enviados ao servidor central.
* Após sucesso, os registros locais devem ser marcados como sincronizados.
* Em conflito, deve ser aplicada a regra “último timestamp vence”.
* A limitação da estratégia deve estar documentada.
* Em falha de sincronização, os dados devem permanecer localmente como pendentes.
* O usuário não deverá precisar disparar manualmente a sincronização.

### US-10 — Indicação Visual de Modo Offline

**Como** guarda de segurança,
**quero** visualizar quando o aplicativo estiver offline,
**para que** eu saiba que os registros ainda não foram sincronizados.

#### Critérios de Aceite

* O aplicativo deve exibir indicação clara enquanto estiver offline.
* O indicador deve informar que os dados foram salvos localmente.
* O indicador deve desaparecer após sincronização bem-sucedida.
* O indicador deve estar visível durante o uso das funções principais.

---

## 4. História Mais Complexa do MVP

## US-09 — Sincronização Automática Offline para Servidor

A US-09 é a história mais complexa do MVP porque reúne desafios técnicos que não aparecem isoladamente nas outras histórias:

1. **Detecção de conectividade:** o aplicativo precisa identificar quando a internet retorna.
2. **Fila local de sincronização:** os registros em SQLite precisam possuir estados como pendente, sincronizado ou erro.
3. **Envio para o servidor:** registros locais devem ser enviados para a API Node.js/Express e persistidos em PostgreSQL.
4. **Resolução de conflitos:** em registros conflitantes, será adotada a estratégia “último timestamp vence”, reconhecida como limitação do MVP.
5. **Transparência para o usuário:** o indicador offline deve refletir corretamente o estado da sincronização.
6. **Resiliência a falhas:** erros de rede ou indisponibilidade do servidor não podem causar perda dos registros locais.
7. **Validação técnica:** o RVS determina que o módulo offline/sincronização seja validado por POC ou spike técnico nas semanas iniciais.

---

## 5. Caso de Uso Detalhado — UC04: Sincronizar Dados com o Servidor

| Item                         | Descrição                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| Caso de Uso                  | UC04 — Sincronizar Dados com o Servidor                                                    |
| Ator beneficiado             | Guarda de Segurança                                                                        |
| Sistema externo participante | Servidor Central                                                                           |
| Pré-condição                 | Existem registros locais pendentes e o dispositivo recuperou conexão com a internet.       |
| Pós-condição                 | Os registros foram sincronizados ou permanecem localmente como pendentes em caso de falha. |

### Fluxo Principal

1. O sistema detecta que a conexão foi restaurada.
2. O sistema consulta os registros pendentes armazenados em SQLite.
3. O sistema envia os registros pendentes para a API.
4. O servidor processa os registros e aplica a regra de resolução de conflitos, quando necessário.
5. O servidor persiste os dados em PostgreSQL e retorna confirmação.
6. O aplicativo marca os registros confirmados como sincronizados.
7. O indicador visual offline é removido após a sincronização bem-sucedida.

### Fluxos Alternativos

| Código | Situação                          | Tratamento                                                                                   |
| ------ | --------------------------------- | -------------------------------------------------------------------------------------------- |
| FA-01  | Não existem registros pendentes   | O sistema remove o indicador offline sem enviar dados.                                       |
| FA-02  | Conflito de timestamp             | O registro mais recente prevalece e a ocorrência deve ser registrada para auditoria.         |
| FA-03  | Conexão cai durante sincronização | Apenas registros confirmados são marcados como sincronizados; os demais continuam pendentes. |

### Fluxos de Exceção

| Código | Situação                         | Tratamento                                                                     |
| ------ | -------------------------------- | ------------------------------------------------------------------------------ |
| FE-01  | Servidor indisponível ou timeout | Registros permanecem pendentes e nova tentativa deverá ocorrer posteriormente. |
| FE-02  | Servidor retorna erro            | O erro é registrado e os dados locais são preservados.                         |
| FE-03  | Falha grave nos dados locais     | O processo é interrompido e requer tratamento técnico.                         |
| FE-04  | Perda de conexão durante envio   | O registro não confirmado permanece pendente para reenvio posterior.           |

---

## 6. Rastreabilidade: Épico, História, Requisito e Caso de Uso

| Épico                                      | Histórias                  | Requisitos Relacionados                                           | Caso de Uso                                            |
| ------------------------------------------ | -------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| Épico 1 — Identificação e Rastreabilidade  | US-01, US-02, US-03        | RF01, RF04, RF09, RN02                                            | UC01 — Identificar Responsável                         |
| Épico 2 — Gestão de Retirada e Devolução   | US-04, US-05, US-06, US-07 | RF02, RF03, RF04, RF05, RF06, RF09, RN01, RN03, RN04, RN05 e RN06 | UC02 — Registrar Retirada / UC03 — Registrar Devolução |
| Épico 3 — Operação Offline e Sincronização | US-08, US-09, US-10        | RF07, RF08, RF10, RN07, RNF03, RNF05, RNF06 e RNF08               | UC04 — Sincronizar Dados                               |

---

## 7. Tarefas Técnicas Iniciais Derivadas do Backlog

| História | Tarefas Iniciais                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| US-01    | Criar tela de identificação; validar nome e matrícula; manter identificação na sessão.                                      |
| US-04    | Criar quadro visual de chaves; implementar indicação de disponibilidade; carregar dados locais.                             |
| US-05    | Implementar retirada; validar chave disponível; registrar timestamp; persistir localmente.                                  |
| US-06    | Implementar devolução; atualizar status; persistir horário de devolução.                                                    |
| US-08    | Configurar armazenamento local SQLite; permitir operações sem internet.                                                     |
| US-09    | Criar fila de registros pendentes; integrar sincronização com API; aplicar regra de conflito; preservar registros em falha. |
| US-10    | Criar indicador visual de modo offline e estado de sincronização.                                                           |

---

## 8. Observações de Validação

As histórias e tarefas relacionadas à substituição do caderno físico devem considerar que a autorização institucional para substituir formalmente a assinatura física ainda depende de confirmação.

Também permanecem pendentes de validação:

* quantidade de dispositivos utilizados simultaneamente;
* disponibilidade do servidor do campus;
* fluxo operacional durante a transição do caderno para o aplicativo;
* acesso ao histórico por outros stakeholders além do guarda.
