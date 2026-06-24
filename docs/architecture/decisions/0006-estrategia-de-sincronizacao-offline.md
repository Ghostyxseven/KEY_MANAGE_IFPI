# ADR 0006 — Estratégia de Sincronização Offline

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech

## Contexto
A operação offline-first (RF07, RNF03) é o componente de maior risco técnico do MVP devido à infraestrutura instável do campus. Quando a internet cai, os dados são salvos localmente no SQLite. Ao restabelecer a rede, as informações precisam ser sincronizadas com o PostgreSQL. Precisamos de uma política clara para resolver conflitos de concorrência quando múltiplos dispositivos alterarem dados da mesma chave simultaneamente no estado offline. Consideramos o algoritmo robusto de Vetores de Relógio (Vector Clocks) ou fluxos de intervenção manual do administrador.

## Decisão
Adotamos o algoritmo **"Último Timestamp Vence" (Last Write Wins — LWW)** como mecanismo automatizado de resolução de conflitos, utilizando o carimbo de data/hora local dos dispositivos móveis para determinar a versão final aceita pelo servidor PostgreSQL.

## Consequências
- **Positivas:** Implementação simples, direta e de baixo custo de codificação, perfeitamente viável dentro do cronograma do semestre letivo. Garante a fluidez e a automação do processo na guarita, sem exigir que o guarda interrompa seu trabalho para resolver conflitos operacionais na tela.
- **Negativas / Trade-offs:** **Risco crítico de perda silenciosa de dados**. Se dois dispositivos registrarem movimentações concorrentes sobre a mesma chave enquanto estiverem offline, o registro com o timestamp mais recente irá sobrescrever e apagar o impacto visual do registro anterior no banco central, sem emitir alertas imediatos na interface. Exige a criação obrigatória de uma tabela paralela de logs de auditoria no servidor apenas para rastrear e armazenar esses dados descartados.