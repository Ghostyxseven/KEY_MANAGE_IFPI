# ADR 0008 — Arquitetura Macro: Monolito Modular + Clean Architecture + Vertical Slices + MVVM

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech

## Contexto
A equipe precisa estabelecer um ecossistema arquitetural macro que unifique o desenvolvimento. O desenho do sistema deve suportar de maneira limpa a persistência offline-first, garantir que as regras de negócio de controle de chaves fiquem completamente isoladas de detalhes visuais e de infraestrutura de banco de dados, e permitir que o time colabore em paralelo sem gerar um código altamente acoplado.

## Decisão
Adotamos a combinação de quatro padrões complementares: **Monolito Modular** para a estratégia de implantação, **Clean Architecture (Ports & Adapters)** para blindar o núcleo de regras de negócio, **Vertical Slices** para a organização de arquivos por recursos no repositório, e **MVVM (Model-View-ViewModel)** para reger o fluxo de dados reativo no aplicativo React Native.

## Consequências
- **Positivas:** Apresenta baixíssimo custo operacional e extrema facilidade de deploy devido à natureza do processo único de banco e servidor. Garante excelente testabilidade de unidade isolando o core do negócio, e permite que os desenvolvedores criem fluxos de telas completos de ponta a ponta de forma ágil e independente.
- **Negativas / Trade-offs:** Aumenta a complexidade de arquivos iniciais (*boilerplate*) e exige uma curva de aprendizado acentuada para os membros do time menos habituados com abstrações de interfaces e injeção de dependências. **Exige disciplina militar nas revisões de código (Pull Requests)**; se o time falhar em policiar as fronteiras (*boundaries*), o sistema degenerará rapidamente em um "Grande Bola de Lama" (*Big Ball of Mud*), com vazamento de queries de banco para as Views e alto acoplamento interno no monolito.