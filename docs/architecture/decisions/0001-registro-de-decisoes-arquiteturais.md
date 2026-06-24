# ADR 0001 — Registro de Decisões Arquiteturais

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech

## Contexto
O time CoreTech é composto por 7 membros com papéis distintos (Scrum Master, PO, Analista, UX/UI, Devs Full Stack). Diante do ritmo ágil de desenvolvimento do MVP, o histórico tradicional de commits do Git se mostra insuficiente para explicar os fundamentos, restrições e alternativas consideradas para as escolhas tecnológicas. Sem um mecanismo de governança assíncrona e visível, o projeto corre o risco de sofrer com oscilações arbitrárias de design, perda de histórico técnico para os avaliadores acadêmicos e desalinhamento dos desenvolvedores.

## Decisão
Adotamos o padrão de **ADRs (Architecture Decision Records)** baseado no modelo de Michael Nygard como ferramenta oficial de governança técnica. Cada decisão arquitetural relevante será documentada em formato Markdown dentro da pasta `docs/architecture/decisions/` seguindo a nomenclatura padronizada `000X-nome-da-decisao.md`. As ADRs serão criadas via Pull Request direcionado à branch `main` e exigirão a aprovação de pelo menos um revisor técnico além do autor. Alterações em decisões passadas não modificarão o arquivo original; em vez disso, criarão um novo registro com o status `Supersedes ADR-XXXX`.

## Consequências
- **Positivas:** Institui uma documentação viva e centralizada diretamente no repositório (Architecture as Code), garantindo total rastreabilidade das escolhas técnicas para o time e para a banca avaliadora. Reduz drasticamente o tempo de alinhamento e protege o projeto contra amnésia arquitetural.
- **Negativas / Trade-offs:** Introduz um custo operacional contínuo de manutenção e revisão de documentos, exigindo alta disciplina da equipe. Há um risco real de burocratização e lentidão no fluxo de desenvolvimento se o processo for aplicado de forma excessiva a decisões corriqueiras ou de baixo impacto. ADRs antigas podem se tornar fontes de confusão caso o time esqueça de aplicar o status `Supersedes` ao atualizar a arquitetura.