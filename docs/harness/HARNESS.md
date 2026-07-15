# AI Harness — Sistema de Gerenciamento de Acesso a Chaves (CoreTech)

Este documento detalha o "cinturão" (harness) construído em torno do
desenvolvimento assistido por IA do MVP, conforme exigido na Entrega Final
de ES2 (critério de maior peso: 35%). Ele cobre as duas forças pedidas:
**Feedforward** (o que entra na IA antes de gerar código) e **Feedback**
(o que valida automaticamente o que a IA gerou).

O harness parte de dois artefatos já travados pelo time:

- `src/specs/openapi.yaml` + `src/specs/schemas/*.ts` — contratos de API e
  de dados (Rigor do SDD).
- `docs/architecture/decisions/ADR-0001..0009.md` — decisões arquiteturais
  (governança, vertical slices, stack, Clean Architecture/MVVM, GoF).

---

## 1. Mecanismo de Feedforward (Garantia de Entrada)

O Feedforward é a disciplina de **nunca deixar a IA gerar código a partir
só da descrição em português da história de usuário**. Todo prompt de
geração de código para uma rota ou regra de negócio deve empacotar, nesta
ordem:

1. **O trecho relevante do `openapi.yaml`** (o path exato, request body,
   todos os response codes — incluindo os de erro). Isso impede a IA de
   inventar um formato de resposta "parecido" ou esquecer o `409`.
2. **O schema Zod correspondente**, com instrução explícita de
   *importar*, nunca recriar um tipo equivalente à mão.
3. **A ADR relevante** (tipicamente a ADR-0009, Strategy/Observer, ou a
   ADR-0002, Vertical Slice) para a IA saber *onde* o arquivo deve morar e
   *que padrão* deve usar para a lógica condicional.
4. **O(s) código(s) de RF/RN/UC/US envolvidos**, para a resposta poder ser
   auditada por rastreabilidade depois.

### Template de prompt usado pelo time

Ver `docs/harness/prompts/feedforward.prompt.md` — é o texto literal
colado no início de qualquer sessão de Claude Code / Copilot / outro
agente antes de pedir geração de um endpoint novo.

### Por que isso importa concretamente

Sem o Feedforward, é comum um agente gerar a validação de RN01
("bloquear retirada de chave em uso") como um `if` solto dentro do
controller, misturando validação de forma com regra de negócio — exatamente
o anti-padrão que a ADR-0009 quer evitar. Ao injetar a ADR-0009 no prompt,
a IA é instruída a produzir uma classe `CheckoutStrategy` implementando
`IKeyOperationStrategy`, isolada e testável — que é o que está em
`src/features/chaves/strategies/checkout.strategy.ts` neste repositório.

---

## 2. Mecanismo de Feedback (Loop de Correção Baseado em Sensores)

Depois que a IA (ou um humano) produz o código, ele passa por três sensores
em sequência, cada um pegando um tipo de erro que o anterior não pega:

```
git commit / PR
      │
      ▼
┌─────────────────┐   falha → devolve à IA/dev com o erro exato
│ 1. Lint          │   (ESLint — eslint.config.js)
│    estilo/padrão │
└────────┬─────────┘
         │ passa
         ▼
┌─────────────────┐   falha → devolve à IA/dev com o erro de tipo
│ 2. Typecheck     │   (tsc --noEmit — tsconfig.json, strict: true)
│    contrato de   │
│    tipos         │
└────────┬─────────┘
         │ passa
         ▼
┌─────────────────┐   falha → devolve à IA/dev com o teste que quebrou
│ 3. Testes        │   (Vitest — tests/contracts/*.test.ts)
│    regra de      │
│    negócio       │
└────────┬─────────┘
         │ passa
         ▼
   PR aprovável (ADR-0001: ainda exige revisão humana por par)
```

Comando único que roda a cadeia inteira (ver `package.json`):

```bash
npm run verify   # = npm run lint && npm run typecheck && npm run test
```

### Camada 1 — Lint (`eslint.config.js`)

Pega **estilo e anti-padrões estruturais**, não lógica de negócio.
Regras específicas deste projeto (não é um preset genérico):

- `@typescript-eslint/no-explicit-any` — proíbe `any`, que mascararia
  exatamente o tipo de erro que os schemas Zod existem para pegar.
- `@typescript-eslint/explicit-function-return-type` — força tipo de
  retorno explícito. **Esta regra pegou um erro real durante a construção
  deste harness**: uma função helper de teste (`novoServico`) foi escrita
  sem tipo de retorno e o lint falhou imediatamente, antes mesmo de chegar
  ao typecheck. Ver seção 3 (Evidência).
- `no-restricted-imports` bloqueando `nodemailer` fora de um `*Adapter` —
  aplica na prática o Padrão Adapter da ADR-0009: se a IA gerar um import
  direto de uma lib de terceiros dentro do service, o lint quebra.

### Camada 2 — Typecheck (`tsconfig.json`, modo `strict`)

Pega **violação de contrato de tipos**: um campo do schema Zod que a IA
esqueceu de preencher, um `Chave["status"]` usado como `string` solta, etc.
Note que o typecheck **não pega regra de negócio** — código
tipologicamente correto ainda pode violar RN01/RN05 (ver Camada 3).

### Camada 3 — Testes de contrato (`tests/contracts/*.test.ts`)

Esta é a camada que valida **regra de negócio**, não forma. Os testes em
`tests/contracts/chaves.contract.test.ts` cobrem diretamente RN01, RN02 e
RN05, chamando o `ChavesService` real (não mocks) e verificando os
códigos de status e de erro que o `openapi.yaml` promete.

---

## 3. Evidência: o Harness pegando uma regressão real

Para provar que a Camada 3 realmente é necessária (e que as Camadas 1–2
sozinhas não bastam), simulamos uma regressão deliberada: comentamos a
checagem de RN01 dentro de `CheckoutStrategy`, como um agente de IA sem
harness poderia produzir ao "simplificar" o código.

| Sensor | Resultado com o bug simulado |
|---|---|
| Lint | ✅ passa (bug não é um problema de estilo) |
| Typecheck | ✅ passa (bug não é um problema de tipo) |
| Testes de contrato | ❌ **falha**: `expected 201 to be 409` no teste `bloqueia a segunda retirada com 409 CHAVE_JA_EM_USO (RN01)` |

Isso demonstra por que o critério de avaliação do professor pesa
"Harness Engineering" em 35%: sem a Camada 3, um código que compila e
passa no lint pode ainda assim violar silenciosamente uma regra de negócio
crítica — exatamente o tipo de "alucinação de contrato" que o SDD com
Harness existe para impedir.

---

## 4. Estrutura de arquivos deste harness

```
package.json              # scripts: lint, typecheck, test, verify
eslint.config.js           # Camada 1
tsconfig.json              # Camada 2 (strict: true)
src/
  specs/                   # contratos travados (OpenAPI + Zod) — Feedforward
  core/interfaces/          # IKeyOperationStrategy (ADR-0009)
  features/chaves/
    strategies/            # CheckoutStrategy, ReturnStrategy (RN01, RN05)
    chaves.service.ts       # orquestra validação de forma + regra de negócio
tests/
  contracts/
    chaves.contract.test.ts # Camada 3 — RN01, RN02, RN05
docs/
  harness/
    HARNESS.md              # este documento
    prompts/
      feedforward.prompt.md # template de prompt usado com a IA
```

## 5. Limitações conhecidas / próximos passos

- ~~RN07 (conflito de sincronização, US-09) ainda não tem teste de contrato~~
  — **resolvido**: `tests/contracts/sync.contract.test.ts` cobre RN07
  diretamente, incluindo o cenário exato descrito no RVS §3.1 (dois
  guardas, dois dispositivos offline, mesma chave, timestamps diferentes).
  Ver seção 3.1 abaixo para a evidência de que o typecheck já pegou um
  problema real durante a escrita desse serviço.
- O harness roda localmente via `npm run verify`. Falta cablear isso em
  CI (GitHub Actions) para rodar automaticamente em todo Pull Request,
  conforme a governança já definida na ADR-0001.

### 5.1 Evidência adicional: o typecheck pegando um bug antes do teste

Ao implementar `SyncService`, o destructuring `[vencedora, ...perdedoras] =
ordenarPorTimestampDesc(...)` compilou sem erro num `tsconfig` comum — mas
falhou o typecheck aqui porque `noUncheckedIndexedAccess: true` está
ativado (ver `tsconfig.json`), que força o TypeScript a tratar o primeiro
elemento de um array como possivelmente `undefined`. Isso pegou, em tempo
de compilação, um caso real que só apareceria em produção se
`agruparPorChave` algum dia devolvesse uma lista vazia — antes mesmo de
qualquer teste rodar. A correção foi uma guarda explícita e comentada no
código (`if (!vencedora) continue`), não uma supressão do erro.

Isso reforça o argumento da seção 2: cada camada do harness pega uma
classe diferente de erro — aqui foi a Camada 2 (typecheck) que pegou algo
que nem lint nem teste pegariam da mesma forma.