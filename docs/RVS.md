# Relatório de Viabilidade de Software (RVS)

## Sistema de Gerenciamento de Acesso a Chaves de Salas e Laboratórios

| Informação            | Descrição                                    |
| --------------------- | -------------------------------------------- |
| Instituição           | Instituto Federal do Piauí — Campus Piripiri |
| Componente Curricular | Engenharia de Software II                    |
| Professor             | Mayllon Veras                                |
| Empresa/Time          | CoreTech                                     |
| Data                  | Abril de 2026                                |

## Time do Projeto

* Wesley Tiago — Scrum Master
* Antonio Carlos — Product Owner
* Ana Rosa Pereira Chaves — Analista de Requisitos
* Eric Vinicius — UX/UI
* Roger Pierre — Desenvolvedor Full Stack
* Nilson Rodrigo — Desenvolvedor Full Stack

---

## 1. Contexto e Problema Identificado

O controle de chaves de salas e laboratórios do IFPI Campus Piripiri é realizado manualmente. Professores e servidores assinam um caderno na guarita ao retirar as chaves e, durante a troca de turno, os guardas transcrevem manualmente as chaves ainda não devolvidas para outro caderno.

Durante entrevistas realizadas com o guarda responsável e com o técnico de TI do campus, em abril de 2026, foram identificados os seguintes problemas:

* **Falta de padronização:** não há identificador único por chave, dificultando o rastreio preciso de responsabilidade.
* **Erros humanos:** registros incompletos, rasuras e transcrições incorretas entre turnos comprometem a confiabilidade dos dados.
* **Instabilidade de internet:** o campus sofre quedas frequentes de rede, inviabilizando sistemas totalmente dependentes de conexão.
* **Preferência por celular:** o guarda relatou dificuldade com computadores e preferência por interfaces mobile.
* **Tempo de transcrição entre turnos:** o processo manual consome, em média, de 25 a 30 minutos por troca de turno.

---

## 2. Descrição da Solução Proposta

A solução proposta é uma aplicação mobile com funcionamento offline, destinada a substituir o caderno físico utilizado na guarita por registros digitais padronizados.

### Funcionalidades previstas para o MVP

* Identificação por nome e matrícula, sem perfis diferenciados no MVP.
* Quadro virtual de chaves com status **Disponível** ou **Em uso**.
* Indicadores visuais de cor: verde para disponível e vermelho para em uso.
* Identificação das chaves pelo código já utilizado no campus, como `A/S9`.
* Registro de retirada de chave.
* Registro de devolução de chave.
* Armazenamento local durante períodos sem internet.
* Sincronização dos registros quando a conexão for restaurada.

### Funcionalidades fora do MVP

* Perfis diferenciados por papel, como guarda, professor, direção ou gestor.
* Relatórios históricos avançados.
* Notificações push.
* Dashboard gerencial.
* QR Code.
* Hardware adicional para identificação das chaves.

---

## 3. Análise de Viabilidade — Framework TELOS

## 3.1 Viabilidade Técnica

A stack tecnológica escolhida para o MVP é:

| Componente                  | Tecnologia            |
| --------------------------- | --------------------- |
| Aplicativo mobile           | React Native com Expo |
| Backend / API               | Node.js com Express   |
| Armazenamento local offline | SQLite                |
| Banco central               | PostgreSQL            |

A escolha está relacionada às restrições reais do projeto:

* o usuário principal prefere utilizar celular;
* o campus possui quedas frequentes de internet;
* o sistema precisa registrar operações mesmo sem conexão;
* o PostgreSQL é compatível com o ambiente tecnológico informado pelo técnico de TI, embora a disponibilidade efetiva da infraestrutura do campus ainda dependa de confirmação.

### Experiência atual da equipe

A equipe possui familiaridade com React para desenvolvimento web, mas ainda não possui projetos concluídos em React Native. A adoção de React Native com Expo exige aprendizagem relacionada a:

* ambiente Expo;
* APIs nativas;
* comportamento de aplicativos mobile;
* armazenamento local;
* conectividade;
* integração com SQLite.

Em Node.js e Express, os membros possuem contato anterior em disciplinas, mas ainda não experiência de produção. O possível apoio do técnico de TI deve ser tratado como colaboração pontual, e não como garantia.

### Principal risco técnico: sincronização offline

O componente técnico de maior risco é a sincronização entre o armazenamento local SQLite e o servidor PostgreSQL.

A estratégia inicialmente definida para conflitos é:

> Em caso de conflito entre registros, prevalece o registro com o timestamp mais recente.

Essa estratégia simplifica o desenvolvimento do MVP, mas apresenta limitação relevante: em cenários com múltiplos dispositivos offline simultâneos, um registro pode sobrescrever outro sem alerta imediato ao usuário.

Por esse motivo, o módulo offline/sincronização deverá ser validado por meio de um POC ou spike técnico nas semanas iniciais.

### Decisão sobre QR Code

O uso de QR Code foi descartado do MVP, pois as chaves já possuem identificadores próprios no padrão utilizado pelo campus, eliminando a necessidade de hardware adicional.

### Veredicto técnico

**VIÁVEL COM RISCO.**

A stack é adequada ao problema, mas a implementação depende da validação técnica do módulo offline/sincronização e da adaptação da equipe ao React Native.

---

## 3.2 Viabilidade Econômica

Por se tratar de projeto acadêmico destinado a uma instituição pública, os custos previstos são reduzidos.

| Item                                     | Custo mensal estimado | Custo em 6 meses | Observação                                |
| ---------------------------------------- | --------------------: | ---------------: | ----------------------------------------- |
| Hospedagem em servidor interno do campus |               R$ 0,00 |          R$ 0,00 | Infraestrutura sujeita a confirmação      |
| PostgreSQL no servidor do campus         |               R$ 0,00 |          R$ 0,00 | Sem custo adicional, caso disponibilizado |
| SQLite local                             |               R$ 0,00 |          R$ 0,00 | Tecnologia open source                    |
| Domínio / certificado SSL                |               R$ 8,00 |         R$ 48,00 | Domínio opcional e certificado gratuito   |
| Manutenção pelo time acadêmico           |               R$ 0,00 |          R$ 0,00 | Sem custo no contexto acadêmico           |

Caso o servidor do campus não seja disponibilizado, a equipe prevê a utilização de uma alternativa de hospedagem para projetos acadêmicos.

### Benefícios estimados

Com base na entrevista com o guarda, a transcrição manual consome entre 25 e 30 minutos por troca de turno. Considerando duas trocas por dia, o sistema poderá gerar economia potencial de 50 a 60 minutos diários.

Também são esperados benefícios relacionados a:

* redução de rasuras;
* redução de registros incompletos;
* maior rastreabilidade;
* melhoria no controle patrimonial.

### Veredicto econômico

**VIÁVEL.**

O custo previsto é reduzido e os benefícios operacionais são relevantes.

---

## 3.3 Viabilidade Legal

O sistema tratará dados pessoais, incluindo:

* nome;
* matrícula;
* horário de retirada;
* horário de devolução;
* histórico de acesso às chaves.

Portanto, o sistema deverá observar princípios aplicáveis da Lei Geral de Proteção de Dados (LGPD), especialmente:

* minimização dos dados coletados;
* acesso restrito às informações;
* tratamento apenas dos dados necessários para rastreabilidade das operações.

### Risco legal crítico: validação formal do registro digital

Durante as entrevistas, foi identificada a necessidade de confirmar formalmente se o registro digital por nome e matrícula pode substituir a assinatura física atualmente utilizada no caderno.

Caso a assinatura física seja uma exigência administrativa formal, o sistema poderá ser desenvolvido e demonstrado academicamente, mas não poderá substituir definitivamente o processo atual sem autorização expressa da direção do campus ou da instância responsável.

* **Responsável previsto pela confirmação:** Wesley Tiago, Scrum Master.
* **Prazo previsto:** até o final da Semana 2.

### Veredicto legal

**VIÁVEL COM RESSALVA CRÍTICA.**

A implantação real depende da confirmação formal da validade do registro digital.

---

## 3.4 Viabilidade Operacional

A solução foi planejada considerando as necessidades relatadas pelo usuário principal, o guarda da guarita.

As decisões operacionais principais são:

* interface mobile-first;
* fluxo simplificado;
* retirada e devolução em poucos toques;
* indicadores visuais de status;
* operação offline;
* redução da dependência do caderno físico.

O suporte do técnico de TI do campus foi citado como possível colaboração pontual. Contudo, essa colaboração não é garantida e não deve ser tratada como dependência essencial para a conclusão do MVP.

### Veredicto operacional

**VIÁVEL COM ATENÇÃO.**

A proposta possui boa aderência às necessidades do usuário, mas dependerá de testes reais e validação do processo de implantação.

---

## 3.5 Viabilidade de Cronograma

O prazo acadêmico prevê a entrega de um MVP funcional até o início de julho de 2026, totalizando aproximadamente 11 semanas de desenvolvimento a partir de abril.

| Fase                                         |   Duração | Entregável principal                                                      |
| -------------------------------------------- | --------: | ------------------------------------------------------------------------- |
| Spike técnico, requisitos e wireframes       | 2 semanas | POC offline/sincronização, casos de uso, wireframes e modelo de dados     |
| Desenvolvimento das funcionalidades centrais | 5 semanas | Identificação, retirada, devolução, status e funcionamento offline básico |
| Testes piloto e ajustes                      | 2 semanas | Feedback real e correções                                                 |
| Apresentação e entrega final                 | 2 semanas | MVP funcional, demonstração e documentação                                |

### Marcos intermediários

| Marco    | Entregável                                                                        |
| -------- | --------------------------------------------------------------------------------- |
| Semana 2 | POC do módulo offline validado, wireframes aprovados e modelo de dados revisado   |
| Semana 4 | Tela de identificação funcional e retirada operando localmente                    |
| Semana 6 | Modo offline com sincronização integrada e testada em ambiente de desenvolvimento |
| Semana 7 | Teste piloto com guardas reais, feedback coletado e ajustes aplicados             |
| Semana 9 | MVP completo e documentação técnica entregue                                      |

### Veredicto de cronograma

**VIÁVEL COM ATENÇÃO.**

O prazo é possível, desde que o escopo não seja ampliado e o risco da sincronização seja tratado desde o início.

---

## 4. Matriz de Riscos

| Risco                                              | Probabilidade | Impacto | Nível   | Mitigação                                                                                  |
| -------------------------------------------------- | ------------- | ------- | ------- | ------------------------------------------------------------------------------------------ |
| Inexperiência com React Native                     | Alta          | Alto    | Crítico | Spike técnico nas semanas iniciais, pareamento e uso da documentação oficial               |
| Complexidade da sincronização offline              | Média         | Alto    | Alto    | POC do módulo offline, documentação da limitação e simplificação de escopo caso necessário |
| Não validação da substituição da assinatura física | Média         | Alto    | Crítico | Obtenção de confirmação formal da direção antes da implantação real                        |

## 4.1 Detalhamento do Risco Crítico — Inexperiência com React Native

A equipe possui experiência com React para web, mas ainda não possui experiência consolidada com React Native. Essa diferença afeta:

* uso do Expo;
* integração com SQLite;
* detecção de conectividade;
* execução em dispositivos físicos;
* desenvolvimento do fluxo offline.

### Ações de mitigação

* realizar spike técnico nas semanas iniciais;
* desenvolver um POC para o fluxo offline e sincronização;
* utilizar pareamento entre integrantes;
* consultar prioritariamente a documentação oficial do Expo e React Native;
* simplificar a sincronização caso o POC demonstre risco excessivo.

---

## 5. Conclusão e Veredicto Final

O Sistema de Gerenciamento de Acesso a Chaves de Salas e Laboratórios resolve um problema real do IFPI Campus Piripiri: o controle manual, sujeito a erros, demorado e dependente de transcrição entre turnos.

A solução proposta apresenta baixo custo, aderência às necessidades do usuário principal e potencial de reduzir tempo operacional e inconsistências nos registros.

Entretanto, existem condicionantes importantes:

1. o módulo offline/sincronização precisa ser validado tecnicamente;
2. a equipe precisa administrar a curva de aprendizado com React Native;
3. a direção do campus precisa confirmar formalmente se o registro digital pode substituir a assinatura física para implantação real;
4. a disponibilidade de infraestrutura do campus não deve ser tratada como garantida antes de confirmação.

## Veredicto Final

**CHANGE**

O projeto é tecnicamente viável, mas requer ajustes e validações antes do desenvolvimento pleno e da implantação real. O avanço do MVP deve permanecer condicionado à validação técnica da sincronização offline, à gestão da curva de aprendizado com React Native e à confirmação institucional sobre a validade do registro digital.
