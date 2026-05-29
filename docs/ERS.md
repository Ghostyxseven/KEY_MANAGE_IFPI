# Documento de Requisitos de Software (ERS)

## Sistema de Gerenciamento de Acesso a Chaves de Salas e Laboratórios

| Informação  | Descrição                 |
| ----------- | ------------------------- |
| Versão      | 1.0 — Preliminar          |
| Instituição | IFPI — Campus Piripiri    |
| Disciplina  | Engenharia de Software II |
| Professor   | Mayllon Veras             |
| Equipe      | CoreTech                  |

## Membros da Equipe

* Wesley Tiago — Scrum Master
* Antônio Carlos — Product Owner
* Ana Rosa Pereira Chaves — Analista de Requisitos
* Eric Vinicius — UX/UI
* Roger Pierre — Desenvolvedor Full Stack
* Nilson Rodrigo — Desenvolvedor Full Stack

---

## 1. Introdução

### 1.1 Contextualização

O IFPI Campus Piripiri realiza o controle de chaves de salas e laboratórios por meio de um processo manual. Professores e servidores assinam um caderno na guarita ao retirar ou devolver chaves. A cada troca de turno, o guarda responsável transcreve manualmente as chaves ainda não devolvidas para outro caderno.

Durante entrevistas realizadas pela equipe CoreTech com o guarda responsável e com o técnico de TI do campus, em abril de 2026, foram identificadas fragilidades no processo atual.

### 1.2 Problema Atual

Os principais problemas identificados são:

* **Ausência de padronização:** dificuldade de rastrear precisamente cada chave e o responsável por sua retirada.
* **Erros humanos:** rasuras, registros incompletos e transcrições incorretas entre turnos.
* **Impacto operacional:** a transcrição manual consome, em média, de 25 a 30 minutos por troca de turno.
* **Instabilidade de infraestrutura:** o campus sofre quedas frequentes de internet.
* **Preferência por celular:** o guarda relatou preferência por uma interface mobile em vez de computadores.

### 1.3 Objetivo deste Documento

Este documento formaliza os requisitos, restrições, regras de negócio, histórias de usuário e casos de uso do MVP do Sistema de Gerenciamento de Acesso a Chaves de Salas e Laboratórios.

Ele servirá como:

* referência técnica para a equipe CoreTech;
* base para validação com usuários e gestão do campus;
* apoio para construção e priorização do backlog;
* documentação rastreável para o desenvolvimento do MVP.

### 1.4 Natureza Preliminar

Este documento é preliminar e deve ser validado com os usuários e gestores do campus antes de ser considerado definitivo.

Itens que dependem de confirmação externa estão identificados como:

> **PENDENTE DE VALIDAÇÃO COM CLIENTE OU INSTITUIÇÃO**

---

## 2. Visão Geral do Sistema

### 2.1 O que é o Sistema

O Sistema de Gerenciamento de Acesso a Chaves de Salas e Laboratórios é uma aplicação mobile offline-first destinada a digitalizar e padronizar o fluxo de retirada e devolução de chaves atualmente realizado em caderno físico na guarita do IFPI Campus Piripiri.

O sistema deverá funcionar mesmo sem conexão com a internet, armazenando registros localmente e sincronizando-os com o servidor central quando a conexão for restaurada.

### 2.2 Usuário Principal

O usuário principal do MVP é o guarda de segurança que opera a guarita.

Professores e servidores são usuários indiretos, pois seus dados de identificação serão registrados no momento da retirada ou devolução das chaves.

> **PENDENTE DE VALIDAÇÃO COM CLIENTE:** confirmar se professores e servidores terão acesso direto ao aplicativo ou se apenas informarão seus dados ao guarda.

### 2.3 Benefícios Esperados

* Redução do uso de registros manuais em caderno.
* Redução de erros, rasuras e inconsistências.
* Economia estimada de 25 a 30 minutos por troca de turno.
* Rastreabilidade de qual chave está com qual responsável.
* Operação durante quedas de internet.
* Interface simples e adequada ao uso em celular.

---

## 3. Stakeholders

| Stakeholder              | Papel                    | Interesse no Sistema                                               | Influência |
| ------------------------ | ------------------------ | ------------------------------------------------------------------ | ---------- |
| Guarda de Segurança      | Usuário principal        | Registrar retirada e devolução rapidamente, inclusive sem internet | Alta       |
| Técnico de TI            | Suporte técnico indireto | Compatibilidade com infraestrutura tecnológica do campus           | Média      |
| Professores e Servidores | Usuários indiretos       | Ter retiradas e devoluções registradas corretamente                | Baixa      |
| Direção do Campus        | Autoridade institucional | Controle patrimonial, conformidade e validade do registro digital  | Alta       |
| Equipe CoreTech          | Desenvolvedora           | Entregar MVP funcional dentro do prazo acadêmico                   | Alta       |
| Professor Mayllon Veras  | Avaliador acadêmico      | Avaliar aplicação dos conceitos da disciplina                      | Alta       |

---

## 4. Escopo do MVP

### 4.1 O que Entra no MVP

* Identificação por nome e matrícula, sem senha complexa e sem perfis diferenciados.
* Quadro virtual de chaves com status atualizado.
* Indicadores visuais: verde para **Disponível** e vermelho para **Em uso**.
* Identificação das chaves pelo código já utilizado no campus, como `A/S9` e `L/B2`.
* Registro de retirada de chave vinculado à identificação do responsável.
* Registro de devolução de chave com atualização de status.
* Operação offline com armazenamento local em SQLite.
* Sincronização dos dados locais com o servidor PostgreSQL quando a internet for restaurada.
* Histórico local dos registros.
* Indicação visual de operação offline.

### 4.2 O que Não Entra no MVP

* Perfis diferenciados por papel, como guarda, professor, direção ou gestor.
* Relatórios históricos avançados e analíticos.
* Notificações push.
* Dashboard gerencial.
* Cadastro administrativo completo de usuários.
* QR Code.
* Hardware adicional para identificação das chaves.

---

## 5. Requisitos Funcionais

| Código | Descrição                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF01   | O sistema deve permitir a identificação inicial do responsável por nome completo e matrícula, sem perfis diferenciados no MVP.                           |
| RF02   | O sistema deve exibir um quadro visual das chaves cadastradas com seu código de identificação no padrão utilizado pelo campus.                           |
| RF03   | O sistema deve indicar o status de cada chave por cores: verde para **Disponível** e vermelho para **Em uso**.                                           |
| RF04   | O sistema deve permitir registrar a retirada de uma chave, vinculando a operação ao nome e matrícula do responsável e registrando o horário da retirada. |
| RF05   | O sistema deve impedir o registro de retirada de uma chave que já esteja marcada como **Em uso**.                                                        |
| RF06   | O sistema deve permitir registrar a devolução de uma chave, atualizando seu status para **Disponível** e registrando o horário da devolução.             |
| RF07   | O sistema deve funcionar offline, armazenando localmente no dispositivo os registros necessários em SQLite.                                              |
| RF08   | O sistema deve detectar a restauração da conexão e sincronizar os registros locais pendentes com o servidor central em PostgreSQL.                       |
| RF09   | O sistema deve manter histórico local das retiradas e devoluções, contendo responsável, chave e horários correspondentes.                                |
| RF10   | O sistema deve apresentar indicação visual clara quando estiver operando offline e houver dados ainda não sincronizados.                                 |

---

## 6. Requisitos Não Funcionais

| Código | Categoria                 | Descrição                                                                                                                   |
| ------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| RNF01  | Usabilidade               | O fluxo principal de retirada ou devolução deve ser realizado em no máximo 3 toques na tela.                                |
| RNF02  | Mobile-First              | A interface deverá ser desenvolvida para dispositivos móveis, sem versão desktop no MVP.                                    |
| RNF03  | Offline-First             | O sistema deve permitir operação das funcionalidades principais mesmo sem conexão com a internet.                           |
| RNF04  | Desempenho                | O quadro de chaves deve carregar em menos de 2 segundos em modo offline, utilizando dados locais.                           |
| RNF05  | Sincronização             | A sincronização dos dados locais com o servidor deve ocorrer automaticamente quando a conexão for restaurada.               |
| RNF06  | Integridade de Dados      | A estratégia “último timestamp vence” deve ser documentada como limitação conhecida do MVP.                                 |
| RNF07  | Segurança e LGPD          | O MVP deve coletar somente dados mínimos necessários: nome, matrícula e horários das operações.                             |
| RNF08  | Disponibilidade           | O aplicativo deve operar no dispositivo mesmo quando o servidor central estiver indisponível.                               |
| RNF09  | Facilidade de Aprendizado | O fluxo deve ser simples o suficiente para que um guarda consiga realizar uma operação completa em sua primeira utilização. |
| RNF10  | Compatibilidade           | O aplicativo deve ser desenvolvido em React Native com Expo, permitindo execução em dispositivos móveis compatíveis.        |

---

## 7. Regras de Negócio

| Código | Descrição                                                                                                                                                                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN01   | Uma chave não pode ser registrada como retirada por dois responsáveis simultaneamente.                                                                                                                      |
| RN02   | Toda retirada deve estar vinculada a nome e matrícula informados no momento da operação.                                                                                                                    |
| RN03   | Toda devolução deve atualizar imediatamente o status da chave para **Disponível**.                                                                                                                          |
| RN04   | O código das chaves deve seguir o padrão já utilizado no campus, como `A/S9`.                                                                                                                               |
| RN05   | O sistema não deve permitir devolução de uma chave que já esteja marcada como **Disponível**.                                                                                                               |
| RN06   | O sistema deve registrar data e hora de cada retirada e devolução utilizando o horário do dispositivo.                                                                                                      |
| RN07   | Em caso de conflito durante sincronização offline, prevalecerá o registro com timestamp mais recente, sendo essa uma limitação aceita e documentada para o MVP.                                             |
| RN08   | **PENDENTE DE VALIDAÇÃO INSTITUCIONAL:** o uso de nome e matrícula somente poderá substituir administrativamente a assinatura física após confirmação formal da direção ou instância responsável do campus. |

### Observação sobre a RN08

O Relatório de Viabilidade trata a substituição da assinatura física como pendência crítica para implantação. Portanto, enquanto não houver comprovação formal da autorização institucional, a equipe não deverá apresentar essa substituição como decisão confirmada.

---

## 8. Histórias de Usuário

| ID   | História de Usuário                                                                                                                                                                      |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US01 | Como guarda de segurança, quero me identificar no aplicativo informando nome e matrícula, para que minhas ações sejam registradas de forma rastreável sem necessidade de senha complexa. |
| US02 | Como guarda de segurança, quero visualizar o quadro de chaves com status em cores, para identificar rapidamente quais chaves estão disponíveis e quais estão em uso.                     |
| US03 | Como guarda de segurança, quero registrar a retirada de uma chave vinculada ao responsável, para substituir o registro manual de forma padronizada.                                      |
| US04 | Como guarda de segurança, quero registrar a devolução de uma chave com poucos toques, para atualizar o status rapidamente.                                                               |
| US05 | Como guarda de segurança, quero utilizar o aplicativo mesmo quando a internet cair, para continuar realizando registros.                                                                 |
| US06 | Como guarda de segurança, quero que os dados registrados offline sejam sincronizados quando a internet retornar, para evitar transcrição manual posterior.                               |
| US07 | Como guarda de segurança, quero visualizar quando o aplicativo estiver offline, para saber que os dados ainda não foram sincronizados.                                                   |
| US08 | Como guarda de segurança, quero ser impedido de retirar uma chave que já esteja em uso, para evitar inconsistências no controle.                                                         |

---

## 9. Casos de Uso Principais

## UC01 — Identificar Responsável

| Item              | Descrição                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Ator principal    | Guarda de Segurança                                                                                                                     |
| Pré-condição      | Aplicativo instalado e aberto no dispositivo.                                                                                           |
| Fluxo principal   | 1. Usuário informa nome e matrícula. 2. Sistema valida o preenchimento. 3. Sistema registra a identificação e exibe o quadro de chaves. |
| Fluxo alternativo | Dados ausentes ou inválidos: o sistema exibe mensagem de erro e solicita correção.                                                      |
| Pós-condição      | Usuário identificado e apto a registrar operações.                                                                                      |

## UC02 — Registrar Retirada de Chave

| Item              | Descrição                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ator principal    | Guarda de Segurança                                                                                                                                             |
| Pré-condição      | Responsável identificado; chave com status **Disponível**.                                                                                                      |
| Fluxo principal   | 1. Usuário seleciona a chave. 2. Sistema exibe confirmação. 3. Usuário confirma. 4. Sistema registra localmente a retirada e atualiza o status para **Em uso**. |
| Fluxo alternativo | Chave já em uso: o sistema bloqueia a retirada e informa a indisponibilidade.                                                                                   |
| Pós-condição      | Retirada registrada localmente e chave marcada como **Em uso**.                                                                                                 |

## UC03 — Registrar Devolução de Chave

| Item              | Descrição                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ator principal    | Guarda de Segurança                                                                                                                                                       |
| Pré-condição      | Responsável identificado; chave com status **Em uso**.                                                                                                                    |
| Fluxo principal   | 1. Usuário seleciona a chave em uso. 2. Sistema oferece opção de devolução. 3. Usuário confirma. 4. Sistema registra a devolução e atualiza o status para **Disponível**. |
| Fluxo alternativo | Chave já disponível: o sistema bloqueia a ação.                                                                                                                           |
| Pós-condição      | Devolução registrada e chave marcada como **Disponível**.                                                                                                                 |

## UC04 — Sincronizar Dados com o Servidor

| Item              | Descrição                                                                                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ator principal    | Sistema                                                                                                                                                                                                                     |
| Pré-condição      | O dispositivo recupera conexão com a internet e possui registros locais pendentes.                                                                                                                                          |
| Fluxo principal   | 1. Sistema detecta conexão restaurada. 2. Sistema envia registros locais pendentes ao servidor. 3. Servidor processa os dados e confirma sincronização. 4. Aplicativo atualiza o status dos registros e o indicador visual. |
| Fluxo alternativo | Em conflito de timestamp, o sistema aplica a regra “último timestamp vence” e registra a ocorrência para auditoria.                                                                                                         |
| Pós-condição      | Registros locais pendentes sincronizados ou preservados como pendentes em caso de falha.                                                                                                                                    |

---

## 10. Matriz de Prioridade dos Requisitos Funcionais

| Requisito | Descrição Resumida                   | Prioridade | Justificativa                                                 |
| --------- | ------------------------------------ | ---------- | ------------------------------------------------------------- |
| RF01      | Identificação por nome e matrícula   | Essencial  | Necessário para vincular operações a responsáveis.            |
| RF02      | Quadro virtual de chaves             | Essencial  | Interface principal do sistema.                               |
| RF03      | Indicadores visuais de status        | Essencial  | Permite identificar rapidamente disponibilidade.              |
| RF04      | Registro de retirada                 | Essencial  | Funcionalidade central do MVP.                                |
| RF05      | Bloqueio de retirada de chave em uso | Essencial  | Preserva integridade dos registros.                           |
| RF06      | Registro de devolução                | Essencial  | Completa o fluxo central do sistema.                          |
| RF07      | Operação offline                     | Essencial  | Restrição diretamente ligada à infraestrutura do campus.      |
| RF08      | Sincronização automática             | Importante | Necessária para consolidação dos dados quando houver conexão. |
| RF09      | Histórico local                      | Importante | Apoia rastreabilidade durante operação offline.               |
| RF10      | Indicador de modo offline            | Importante | Garante transparência ao usuário.                             |

---

## 11. Riscos e Pontos a Validar

### 11.1 Riscos Herdados do RVS

| Risco                                                  | Probabilidade | Impacto | Nível   | Mitigação                                                      |
| ------------------------------------------------------ | ------------- | ------- | ------- | -------------------------------------------------------------- |
| Curva de aprendizado com React Native                  | Alta          | Alto    | Crítico | Spike técnico, pareamento e documentação oficial do Expo.      |
| Complexidade da sincronização offline                  | Média         | Alto    | Alto    | POC do módulo offline e documentação da limitação de conflito. |
| Resistência à adoção do aplicativo                     | Média         | Alto    | Alto    | Testes com o guarda e plano de transição gradual.              |
| Indisponibilidade de suporte contínuo do técnico de TI | Média         | Médio   | Médio   | Tratar apoio como complementar, sem dependência da equipe.     |
| Falta de validação formal do registro digital          | Média         | Alto    | Crítico | Obter confirmação institucional antes da implantação real.     |

### 11.2 Pontos Pendentes de Validação

* Como ocorrerá a transição entre caderno físico e aplicativo?
* O campus fornecerá dispositivo para uso na guarita?
* Quantas chaves existem atualmente e qual é o padrão completo de codificação?
* Haverá mais de um guarda ou dispositivo operando simultaneamente?
* Quem precisará acessar o histórico de registros?
* O servidor do campus estará disponível para hospedar o backend e o PostgreSQL?
* O registro digital poderá substituir formalmente a assinatura física?
* Haverá treinamento formal para utilização do aplicativo?

---

## 12. Conclusão Executiva

Este Documento de Requisitos constitui a versão preliminar das funcionalidades, restrições e regras de negócio do Sistema de Gerenciamento de Acesso a Chaves de Salas e Laboratórios do IFPI Campus Piripiri.

O MVP deverá concentrar-se no fluxo mínimo de valor:

* identificação do responsável;
* visualização do quadro de chaves;
* retirada;
* devolução;
* funcionamento offline;
* sincronização posterior.

A implantação real do sistema permanece condicionada à confirmação institucional sobre a validade do registro digital em substituição à assinatura física, à validação técnica da sincronização offline e à confirmação da infraestrutura disponível no campus.

## Próximos Passos

* Validar requisitos pendentes com guarda e direção do campus.
* Executar o POC de operação offline e sincronização.
* Revisar o documento após validações externas.
* Consolidar backlog e prioridades do MVP.
