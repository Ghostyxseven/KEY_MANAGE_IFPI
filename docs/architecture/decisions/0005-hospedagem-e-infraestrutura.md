# ADR 0005 — Estratégia de Hospedagem e Infraestrutura

* **Status:** Aceito
* **Data:** 2026-05-28
* **Autor:** CoreTech
* **ID:** ADR 0005
* **Time:** CoreTech
* **Projeto:** Sistema de Gerenciamento de Acesso a Chaves — IFPI Campus Piripiri

---

## Contexto

O sistema necessita de uma infraestrutura capaz de suportar o MVP com disponibilidade externa, sincronização de dados e facilidade de deploy para a equipe acadêmica.

A primeira alternativa considerada pela equipe foi a utilização da infraestrutura local do IFPI Campus Piripiri como ambiente principal de hospedagem, devido ao maior controle institucional e ausência de dependência de serviços externos.

Entretanto, após reunião com o responsável de TI do campus, foram identificadas limitações significativas de capacidade computacional, disponibilidade operacional e suporte contínuo para execução do sistema em ambiente institucional.

Diante dessas restrições, tornou-se necessário avaliar alternativas de hospedagem em nuvem com menor custo operacional e maior simplicidade de gerenciamento.

As alternativas consideradas foram:

* **Servidor local do IFPI:** maior controle institucional e ausência de dependência externa, porém limitado em capacidade e suporte operacional.
* **Railway:** plataforma PaaS com deploy simplificado, integração rápida com aplicações Node.js e PostgreSQL, adequada ao prazo acadêmico.
* **Render:** alternativa semelhante ao Railway, porém ainda não avaliada tecnicamente pela equipe.
* **VPS própria:** maior flexibilidade e controle da infraestrutura, porém com complexidade operacional incompatível com o prazo do semestre e experiência atual da equipe.

A principal preocupação técnica desta decisão envolve o equilíbrio entre simplicidade operacional, disponibilidade do sistema e dependência de serviços terceirizados.

---

## Decisão

A equipe considera atualmente o **Railway** como principal candidato para hospedagem do MVP, utilizando sua infraestrutura gerenciada para deploy da aplicação backend e banco de dados PostgreSQL.

A proposta considera os seguintes fatores:

1. Facilidade de configuração e deploy contínuo para equipe acadêmica.
2. Redução significativa do esforço operacional relacionado à infraestrutura.
3. Compatibilidade direta com Node.js, TypeScript e PostgreSQL.
4. Disponibilidade externa simplificada para acesso e sincronização do sistema.
5. Adequação ao cronograma reduzido do semestre.

O servidor local do IFPI permanece documentado como alternativa inicialmente considerada pela equipe, porém com limitações operacionais identificadas na análise técnica realizada junto à equipe de TI do campus.

A decisão definitiva será validada após testes práticos de deploy, disponibilidade e integração durante o desenvolvimento inicial do MVP.

---

## Consequências

### Positivas

* Possível simplificação do deploy e configuração inicial do MVP.
* Redução do esforço operacional relacionado à infraestrutura.
* Facilidade de integração com PostgreSQL e ambiente Node.js.
* Disponibilidade externa para sincronização e acesso remoto ao sistema.
* Menor complexidade operacional durante o desenvolvimento acadêmico.

### Negativas / Trade-offs

* Dependência parcial de serviço terceirizado para hospedagem.
* Possíveis limitações do plano gratuito da plataforma.
* Risco de necessidade futura de migração para infraestrutura própria em cenários de crescimento.
* Menor controle direto sobre a infraestrutura física do ambiente.

### Mitigações

* Validar a plataforma através de testes práticos de deploy e operação do MVP.
* Estruturar variáveis de ambiente e configurações desacopladas da plataforma específica.
* Realizar backups periódicos do banco de dados PostgreSQL.
* Documentar o processo de deploy para facilitar eventual migração futura.
* Reavaliar alternativas de infraestrutura após validação técnica inicial.

---

## Critérios de aceitação

* Ambiente de hospedagem validado através de deploy funcional do MVP.
* Aplicação backend acessível externamente via HTTPS.
* Banco PostgreSQL funcional e integrado ao sistema.
* Processo de deploy documentado e reproduzível pela equipe.
* Possibilidade de sincronização remota funcionando adequadamente.

---

## Justificativa vinculada ao semestre

A avaliação do Railway representa um trade-off pragmático entre simplicidade operacional e dependência de infraestrutura terceirizada, priorizando a viabilidade técnica do MVP dentro do prazo acadêmico disponível.

A proposta reduz riscos relacionados à manutenção de infraestrutura própria e permite que a equipe concentre esforços na implementação das funcionalidades críticas do sistema antes da definição definitiva da arquitetura operacional.
