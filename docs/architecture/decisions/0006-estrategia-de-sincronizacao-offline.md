# ADR 0006 — Estratégia de Sincronização Offline

**Status:** Accepted  
**Data:** 2026-05-28  
**Time:** CoreTech  
**Projeto:** Sistema de Gerenciamento de Acesso a Chaves — IFPI Campus Piripiri

---

## Contexto

O requisito de operação offline-first (RF07, RNF03) é o **componente técnico de maior risco do MVP**, classificado como risco de nível ALTO no RVS (seção 4). O campus sofre quedas frequentes de internet, e o sistema deve funcionar plenamente sem conexão, sincronizando os registros locais com o servidor PostgreSQL quando a conexão for restaurada (RF08).

A principal decisão técnica deste componente é a **estratégia de resolução de conflitos**: o que acontece quando dois dispositivos registram operações sobre a mesma chave enquanto estavam offline?

Estratégias consideradas:

- **"Último timestamp vence" (Last Write Wins — LWW):** cada registro carrega o timestamp local do dispositivo. Em caso de conflito, o servidor aplica o registro com o horário mais recente. Simples de implementar, sem necessidade de lógica complexa de merge.
- **Resolução manual pelo administrador:** conflitos são sinalizados e aguardam intervenção humana. Mais segura, mas impraticável no fluxo operacional da guarita.
- **Controle de versão por vetor de relógio (Vector Clock):** tecnicamente mais robusto, mas de complexidade desproporcional para o escopo acadêmico e prazo disponível.

A limitação conhecida da estratégia LWW foi explicitada no RVS: em cenários com **múltiplos dispositivos offline simultâneos**, o critério pode causar perda silenciosa de dados — por exemplo, dois guardas registrando a mesma chave em dispositivos desconectados, com o segundo registro sobrescrevendo o primeiro sem alerta. Para o MVP, esta é uma limitação aceita e documentada.

## Decisão

Adotamos a estratégia **"último timestamp vence" (Last Write Wins)** como mecanismo de resolução de conflitos de sincronização offline, com as seguintes salvaguardas:

1. **Cada registro armazena o timestamp local do dispositivo** (data e hora exata, conforme RN06) no momento da operação.
2. Ao sincronizar, o servidor verifica se já existe registro para a mesma chave no mesmo intervalo de tempo. Em caso de conflito, prevalece o registro com o **timestamp mais recente**.
3. O registro sobrescrito é **marcado como "sobrescrito" em log de auditoria** no servidor — não apagado — para consulta futura.
4. O dispositivo cliente utiliza **confirmação explícita do servidor (HTTP 200)** antes de marcar o registro local como "sincronizado". Sem confirmação, o registro permanece com status "pendente".
5. O servidor deve ser **idempotente**: o mesmo registro reenviado não gera duplicação (verificação por ID único do registro).

A viabilidade desta estratégia será validada no **spike técnico das Semanas 1–2** (Marco 1 do cronograma). Caso o POC evidencie risco técnico excessivo, o plano de contingência é simplificar para **sincronização manual iniciada pelo administrador**, preservando o funcionamento offline básico dentro do prazo.

## Consequências

- A estratégia LWW é uma **simplificação aceita para o MVP**, documentada como limitação conhecida em RNF06 e RN07 do Documento de Requisitos.
- O módulo de sincronização (US-09) é a história tecnicamente mais complexa do MVP, envolvendo: detecção de conectividade em tempo real (NetInfo), fila de sincronização local (SQLite com campo de status), resolução de conflitos por timestamp, transparência ao usuário via indicador visual (US-10) e resiliência a falhas parciais.
- A limitação mais crítica deve ser **explicitada no POC** da Semana 1–2: em cenários de múltiplos dispositivos offline simultâneos, registros mais antigos podem ser sobrescritos sem alerta visível ao guarda.
- Para o contexto atual do campus (operação com 1–2 dispositivos no máximo), o risco real de conflito é baixo. A limitação se torna relevante apenas se o sistema for expandido para múltiplos postos simultâneos (pós-MVP).
- O log de auditoria de conflitos (UC_LOG no diagrama UC04) é obrigatório para que a limitação seja gerenciável sem intervenção no código.
