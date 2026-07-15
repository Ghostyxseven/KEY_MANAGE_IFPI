# Product Requirement Document (PRD)
# CoreTech — Sistema de Gerenciamento de Acesso a Chaves

| Informação | Descrição |
|------------|-----------|
| **Produto** | Sistema de Gerenciamento de Acesso a Chaves de Salas e Laboratórios |
| **Versão** | 1.0 — MVP Final |
| **Instituição** | IFPI — Campus Piripiri |
| **Disciplina** | Engenharia de Software II |
| **Professor** | Mayllon Veras |
| **Equipe** | CoreTech |
| **Data** | 2026-06-16 |
| **Status** | Aprovado para desenvolvimento |

---

## 1. Visão Geral do Produto

### 1.1 O que é o produto

O **CoreTech — Sistema de Gerenciamento de Acesso a Chaves** é uma aplicação mobile offline-first destinada a digitalizar e padronizar o fluxo de retirada e devolução de chaves de salas e laboratórios do IFPI Campus Piripiri.

Atualmente, o controle é realizado manualmente em cadernos físicos na guarita. O produto substitui esse processo por registros digitais padronizados, operáveis mesmo sem conexão com a internet e sincronizáveis automaticamente quando a conectividade é restaurada.

### 1.2 Problema resolvido

O processo manual atual gera:
- **Perda de tempo:** transcrição entre turnos consome 25-30 minutos por troca.
- **Erros humanos:** rasuras, registros incompletos e transcrições incorretas.
- **Falta de rastreabilidade:** dificuldade de identificar qual chave está com qual responsável.
- **Instabilidade operacional:** quedas de internet inviabilizam sistemas dependentes de conexão contínua.

### 1.3 Proposta de valor

| Valor | Como o produto entrega |
|-------|------------------------|
| Redução de tempo | Eliminação da transcrição manual entre turnos. |
| Confiabilidade | Registros digitais padronizados, sem rasuras. |
| Rastreabilidade | Consulta imediata do responsável por cada chave. |
| Resiliência | Funcionamento offline com sincronização automática posterior. |
| Simplicidade | Interface mobile-first desenhada para o guarda da guarita. |

---

## 2. Valor de Mercado

### 2.1 Público-alvo

| Persona | Descrição | Necessidade principal |
|---------|-----------|----------------------|
| **Guarda de Segurança** (usuário principal) | Responsável pela guarita do campus. Usa celular, não tem perfil técnico. | Registrar retiradas e devoluções rapidamente, inclusive offline. |
| **Professores e Servidores** (usuários indiretos) | Retiram chaves para acessar salas e laboratórios. | Ter seus registros corretos sem precisar operar o aplicativo diretamente. |
| **Direção do Campus** (stakeholder) | Autoridade institucional responsável pelo patrimônio. | Consultar histórico e garantir conformidade dos registros. |
| **Técnico de TI** (suporte) | Responsável pela infraestrutura tecnológica. | Sistema compatível com o ambiente existente e de baixa manutenção. |

### 2.2 Mercado potencial

O produto resolve um problema específico e real do IFPI Campus Piripiri. A solução é replicável para outros campi do Instituto Federal que utilizem processos manuais semelhantes de controle de chaves.

### 2.3 Diferenciais competitivos

- **Offline-first nativo:** não depende de conectividade contínua.
- **Zero custo operacional:** hospedado no plano gratuito do Firebase (Spark).
- **Baixa curva de aprendizado:** interface mobile-first desenhada para uso imediato.
- **Rastreabilidade completa:** todo registro é vinculado a responsável e horário.

---

## 3. Escopo do MVP

### 3.1 O que entra no MVP (In-Scope)

| Funcionalidade | Descrição | Rastreabilidade |
|----------------|-----------|-----------------|
| Identificação do guarda | Registro por nome + matrícula, sem senha, sem perfis. | RF01, RN02, UC01, US01 |
| Quadro virtual de chaves | Lista visual com status atualizado de cada chave. | RF02, RF03, UC01 |
| Indicadores visuais | Verde = Disponível, Vermelho = Em uso. | RF03 |
| Registro de retirada | Vincula chave a responsável + horário do dispositivo. | RF04, RN01, RN02, RN04, RN06, UC02 |
| Bloqueio de retirada duplicada | Impede retirada se chave já estiver Em uso (HTTP 409). | RF05, RN01, UC02 |
| Registro de devolução | Atualiza status para Disponível + horário do dispositivo. | RF06, RN03, RN05, UC03 |
| Operação offline | Funcionamento completo sem internet, com cache local. | RF07, RNF03, US05 |
| Sincronização automática | Envio de registros pendentes ao restaurar conexão. | RF08, RN07, RNF05, UC04 |
| Histórico local | Consulta de movimentações por chave no dispositivo. | RF09, UC02, UC03 |
| Indicador de modo offline | Indicação visual clara quando há dados não sincronizados. | RF10, US07 |

### 3.2 O que não entra no MVP (Out-of-Scope)

| Funcionalidade | Motivo da exclusão |
|----------------|-------------------|
| Perfis diferenciados (guarda, professor, direção) | Escopo reduzido para manter simplicidade no MVP. |
| Dashboard gerencial | Pós-MVP; direção pode consultar dados após maturidade. |
| Relatórios históricos avançados | Pós-MVP; histórico local já atende necessidade mínima. |
| Notificações push | Não essencial para o fluxo principal. |
| QR Code / NFC para chaves | Chaves já possuem códigos (`A/S9`), conforme RN04 e ADR-0007. |
| Cadastro administrativo de usuários | Não necessário; guarda informa nome/matrícula no momento. |
| Autenticação com senha | RF01/RVS explicitam sem senha complexa no MVP. |

---

## 4. Critérios de Sucesso do Produto

### 4.1 Critérios de aceitação do MVP

| Critério | Métrica de verificação |
|----------|------------------------|
| Identificação funcional | Guarda consegue se identificar em até 3 toques. |
| Retirada bloqueada | Segunda retirada da mesma chave retorna HTTP 409 com código `CHAVE_JA_EM_USO`. |
| Devolução bloqueada | Devolução de chave Disponível retorna HTTP 409 com código `CHAVE_JA_DISPONIVEL`. |
| Modo offline | Aplicação opera sem internet por pelo menos 1 hora com cache local. |
| Sincronização | Após restauração de conexão, registros pendentes são enviados automaticamente. |
| Código de chave | Padrão `A/S9` validado tanto no cliente quanto no servidor. |
| Harness validado | `npm run verify` passa sem erros (lint + typecheck + testes). |
| Spec-Driven | Todo endpoint implementado corresponde 1:1 ao `openapi.yaml`. |

### 4.2 Métricas de sucesso operacional

| Métrica | Meta |
|---------|------|
| Tempo de transcrição entre turnos | Reduzido de 25-30 min para 0 min. |
| Taxa de registros incompletos | Reduzida para 0% (validação obrigatória). |
| Disponibilidade do sistema | 100% offline, sem dependência de servidor para operação local. |
| Custo operacional mensal | R$ 0,00 (plano Spark do Firebase). |

---

## 5. Personas e Jornadas do Usuário

### 5.1 Persona principal: Guarda de Segurança

**Nome fictício:** Carlos  
**Idade:** 45 anos  
**Experiência tecnológica:** Básica; usa celular para WhatsApp e fotos.  
**Contexto:** Trabalha na guarita do IFPI Campus Piripiri há 8 anos. Realiza duas trocas de turno por dia.

**Jornada principal (retirada de chave):**
1. Carlos abre o aplicativo no celular da guarita.
2. Informa seu nome e matrícula (ou usa sessão anterior).
3. Visualiza o quadro de chaves (verde = disponível, vermelho = em uso).
4. Seleciona a chave desejada (ex: `A/S9`).
5. Informa o nome e matrícula do professor/servidor que retira a chave.
6. Confirma a retirada.
7. O sistema registra localmente e atualiza o status para Em uso.
8. Se houver internet, sincroniza automaticamente com o Firestore.

**Jornada de exceção (sem internet):**
1. Mesmos passos 1-7 acima.
2. O sistema exibe indicador visual "Modo Offline — Dados pendentes de sincronização".
3. Os registros ficarm armazenados localmente no Firestore cache.
4. Quando a internet retornar, o Firebase SDK sincroniza automaticamente.

---

## 6. Requisitos Funcionais (Resumo Executivo)

| Código | Descrição resumida | Prioridade |
|--------|-------------------|------------|
| RF01 | Identificação por nome e matrícula | Essencial |
| RF02 | Quadro virtual de chaves | Essencial |
| RF03 | Indicadores visuais (verde/vermelho) | Essencial |
| RF04 | Registro de retirada vinculado ao responsável | Essencial |
| RF05 | Bloqueio de retirada de chave já em uso | Essencial |
| RF06 | Registro de devolução com atualização de status | Essencial |
| RF07 | Operação offline com cache local | Essencial |
| RF08 | Sincronização automática ao restaurar conexão | Importante |
| RF09 | Histórico local de movimentações | Importante |
| RF10 | Indicador visual de modo offline | Importante |

---

## 7. Regras de Negócio (Resumo Executivo)

| Código | Descrição | Impacto no MVP |
|--------|-----------|----------------|
| RN01 | Uma chave não pode ser retirada por dois responsáveis simultaneamente. | HTTP 409 na retirada. |
| RN02 | Toda retirada/devolução deve estar vinculada a nome e matrícula. | Campos obrigatórios no payload. |
| RN03 | Devolução atualiza status para Disponível imediatamente. | Atualização síncrona local. |
| RN04 | Código das chaves segue padrão `Bloco/Sala` (ex: `A/S9`). | Regex de validação no schema. |
| RN05 | Não permite devolução de chave já Disponível. | HTTP 409 na devolução. |
| RN06 | Horários registrados são os do dispositivo (timestamp local). | Campo `timestampLocal` obrigatório. |
| RN07 | Conflitos de sincronização: último timestamp vence (limitação documentada). | Algoritmo LWW no `SyncService`. |
| RN08 | Uso digital depende de validação institucional (assinatura física). | Fora do escopo técnico do MVP. |

---

## 8. Arquitetura e Stack Tecnológica

### 8.1 Stack final (conforme ADRs 0010-0012)

| Camada | Tecnologia | ADR de referência |
|--------|-----------|-------------------|
| Frontend mobile | React Native + Expo + TypeScript | ADR-0003 (original), mantido |
| Backend / API | Firebase Cloud Functions (Node.js) | ADR-0011 |
| Banco de dados central | Firebase Cloud Firestore | ADR-0010 |
| Cache local / Offline | Firestore SDK native cache | ADR-0012 |
| Hospedagem | Firebase Hosting | ADR-0011 |
| Validação de dados | Zod (runtime schemas) | ADR-0003 (mantido) |
| Testes | Vitest | ADR-0002 |
| Lint | ESLint + TypeScript ESLint | ADR-0002 |
| Gerenciamento de estado | MVVM (ViewModel + Observable) | ADR-0008 |
| Padrões de projeto | Strategy, Observer, Adapter | ADR-0009 |

### 8.2 Decisões arquiteturais relevantes

- **ADR-0001:** ADRs como ferramenta de governança técnica.
- **ADR-0002:** Vertical Slices + Clean Architecture para organização.
- **ADR-0004:** Autenticação por nome + matrícula, sem senha.
- **ADR-0007:** Identificação por código textual (`A/S9`), sem hardware adicional.
- **ADR-0008:** Monolito modular com MVVM no frontend.
- **ADR-0009:** Strategy pattern para regras de retirada/devolução; Observer para efeitos colaterais de sincronização.
- **ADR-0010:** Substituição de PostgreSQL por Firebase Firestore.
- **ADR-0011:** Hospedagem unificada no Firebase.
- **ADR-0012:** Sincronização offline via cache nativo do Firestore.

---

## 9. Fluxo de Desenvolvimento (Spec-Driven + Harness)

### 9.1 Princípio

Nenhuma linha de código é escrita antes que a especificação correspondente esteja travada. O desenvolvimento segue o ciclo:

```
Spec (OpenAPI + Zod) → Feedforward (prompt com contrato injetado) → Geração de código → Harness (Lint → Typecheck → Testes) → Código aprovado
```

### 9.2 Mecanismo de Feedforward

Todo prompt de geração de código contém, obrigatoriamente:
1. Trecho do `openapi.yaml` com o path, request body e response codes.
2. Schema Zod correspondente (importar, não recriar).
3. ADR relevante (Strategy/Observer ou Vertical Slice).
4. Códigos de RF/RN/UC/US envolvidos.

### 9.3 Mecanismo de Feedback (Harness)

Três sensores automáticos em sequência:

| Camada | Ferramenta | O que pega |
|--------|-----------|------------|
| 1 — Lint | ESLint | Estilo, anti-padrões estruturais, imports proibidos. |
| 2 — Typecheck | TypeScript (strict) | Violação de contratos de tipo, campos faltantes. |
| 3 — Testes | Vitest | Violação de regras de negócio (RN01, RN05, RN07). |

Comando único: `npm run verify`

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Vendor lock-in Firebase | Média | Médio | Dados exportáveis via Admin SDK; documentação de migração. |
| Curva de aprendizado Firebase | Média | Médio | Spike técnico nas semanas iniciais; documentação oficial. |
| Conflitos offline simultâneos | Baixa | Médio | Limitação documentada (RN07); LWW aceito no MVP. |
| Resistência à adoção | Média | Alto | Testes com o guarda; transição gradual com caderno paralelo. |

---

## 11. Pós-MVP (Roadmap)

| Funcionalidade | Descrição |
|----------------|-----------|
| Dashboard gerencial | Visão consolidada para direção do campus. |
| Relatórios históricos | Exportação e análise de movimentações. |
| Notificações push | Alertas para devoluções pendentes. |
| Perfis de acesso | Guarda, professor, direção com permissões distintas. |
| QR Code | Identificação física das chaves. |
| Gestão administrativa | CRUD de chaves, usuários e configurações. |

---

## 12. Aprovações

| Papel | Nome | Assinatura | Data |
|-------|------|-----------|------|
| Product Owner | Antônio Carlos | | |
| Scrum Master | Wesley Tiago | | |
| Analista de Requisitos | Ana Rosa Pereira Chaves | | |
| Desenvolvedor Full Stack | Roger Pierre | | |
| Desenvolvedor Full Stack | Nilson Rodrigo | | |
| Avaliador | Mayllon Veras | | |
