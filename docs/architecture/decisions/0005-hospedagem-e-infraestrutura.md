Decisão
--------
Prioritizamos o uso do **servidor do campus (Node.js + PostgreSQL)** como primeira opção operacional, por compatibilidade com o ambiente existente e por custo zero estimado no RVS. **BaaS / serviços gerenciados (ex.: Railway, Neon)** são mantidos como **plano de contingência** caso o servidor do campus não esteja disponível ou sua utilização seja inviável.

Consequências
------------

### Positivas
- Uso do servidor do campus reduz custos e evita dependência externa; favorece conformidade institucional.
- Compatibilidade técnica com o ambiente de TI local facilita deploy e suporte por parte do técnico do campus.

### Negativas / Trade-offs
- Dependência da disponibilidade e prioridade do TI do campus; pode haver limitação de SLA e disponibilidade.
- Possível necessidade de adaptar processos de deploy e backups à política interna do campus.

### Mitigações
- Manter scripts de deploy e `docker-compose`/CI para migração rápida para BaaS caso necessário.
- Definir política de fallback: se o servidor do campus não estiver confirmado até a Semana 2, ativar provisionamento em Railway/Neon.
- Encapsular integrações específicas do provedor em `adapters/` para reduzir acoplamento.
	- Menos trabalho inicial com infraestrutura e monitoramento.

- Negativas / Trade-offs:
	- Dependência do provedor e possível lock-in.
	- Limitações na configuração e possíveis custos em produção.

Mitigações
---------

- Documentar infra e manter exemplos de `docker-compose` e comandos de migração para facilitar migração futura.
- Isolar integrações do provider em adaptadores para reduzir acoplamento.
- Monitorar uso e custos; definir alertas e limites no provedor.

Critérios de aceitação
----------------------

- Processo de deploy documentado e automatizado (CI/CD) para frontend e backend.
- Variáveis de ambiente e segredos centralizados em secrets do CI e exemplos em `.env.example`.

Notas de implementação
--------------------

- Armazenar segredos sensíveis em variáveis de ambiente e não expor chaves de serviço no frontend.
- Para backups e migrações, preferir uso de migrations automatizadas (`prisma migrate deploy`) em CI e políticas de backup do provedor.

 Justificativa vinculada ao semestre
 ----------------------------------

 Escolhemos BaaS/serviços gerenciados para reduzir esforço operacional e permitir foco nas features do MVP durante o prazo do semestre.

