
# ADR 0004 — Estratégia de Autenticação

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech
- **ID:** ADR 0004

Contexto
-------
Autenticação e autorização são áreas críticas de segurança e frequentemente exigem atenção operacional contínua (gestão de senhas, hashing, recuperação, MFA, monitoramento). O prazo do MVP e a composição da equipe sugerem priorizar segurança e velocidade de entrega.


Alternativas consideradas:

- Solução gerenciada (Serviço de Identidade - IdaaS): Firebase Auth, Auth0 — prós: integração rápida, segurança delegada; contras: custo e lock-in parcial.
- Solução customizada: JWT com armazenamento próprio de credenciais — prós: controle total; contras: maior esforço e risco de implementação insegura.

Decisão
--------
Para o escopo do MVP adotamos uma estratégia simplificada: **autenticação por `nome` e `matrícula`** local no dispositivo (sem senha, sem fluxo de recuperação) para acomodar o perfil do guarda e a operação offline-first. Este fluxo atende os critérios de usabilidade detectados no RVS e no DR.

Nota: a adoção de um provedor IdAaS (ex.: Auth0, Firebase Auth) é considerada uma opção pós‑MVP para ambientes de produção que exigirem gerenciamento centralizado de contas, reset de credenciais e políticas de segurança mais avançadas. Se necessário futuramente, a integração com um provedor deverá ser encapsulada em `adapters/auth/` para facilitar troca sem impactar o core.

Consequências
------------

### Positivas
- Fluxo de autenticação simples e alinhado ao perfil do usuário principal (guarda), reduzindo barreira de uso e treinamento.
- Funciona totalmente em modo offline, atendendo restrição RNF03.

### Negativas / Trade-offs
- Menor robustez para cenários que exigam controle de acesso refinado, recuperação de credenciais ou auditoria centralizada (funcionalidades de pós‑MVP).

### Mitigações
- Encapsular a lógica de autenticação em `adapters/auth/` desde o início para facilitar migração futura para IdAaS se necessário.
- Documentar claramente no README e nas ADRs a limitação do MVP e o plano de evolução para produção.

Critérios de aceitação
----------------------

- Identificação por `nome` e `matrícula` funcional no app em modo offline e online.
- Fluxo de identificação de sessão preserva `nome` e `matrícula` durante a sessão sem exigir conexão.
- Módulo de autenticação encapsulado em `adapters/auth/` com documentação de como migrar para IdAaS pós‑MVP.

Notas de implementação
--------------------

- Armazenar segredos em variáveis de ambiente: `PROVIDER_URL`, `PROVIDER_ANON_KEY`, `PROVIDER_SERVICE_ROLE_KEY`.
- Para operações sensíveis, utilizar verificação server-side com a chave de serviço do provedor.
- Considerar Row-Level Security (RLS) no Postgres quando aplicável e documentar as políticas.

Justificativa vinculada ao semestre
----------------------------------

Escolhemos IdAaS para reduzir tempo de implementação e risco de falhas de segurança, priorizando entrega do MVP dentro do semestre.

