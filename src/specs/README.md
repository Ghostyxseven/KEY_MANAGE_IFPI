# Specs — Sistema de Gerenciamento de Acesso a Chaves (CoreTech)

Este diretório contém os **contratos travados** do MVP, exigidos pela entrega
final de ES2 ("Rigor do SDD — 25% da nota"). Nenhuma implementação (manual ou
gerada por IA) deve divergir do que está aqui. Em caso de divergência, a spec
vence — o código é ajustado, não o contrário.

## Pré-requisitos / instalação

Os schemas em `schemas/*.ts` usam a biblioteca [Zod](https://zod.dev). No
projeto do backend (não neste diretório de specs isolado), instale:

```bash
npm install zod
```

`zod` é dependência de produção (não `devDependency`) — a validação roda em
runtime, é o mecanismo de Feedback do Harness, não só suporte a testes.

Se o `tsc` reclamar de `moduleResolution` ao compilar estes arquivos, use
`"moduleResolution": "bundler"` (ou `"node16"`/`"nodenext"`) no
`tsconfig.json` do projeto — `"node"` (node10) foi removido em versões
recentes do TypeScript e não compila mais.

## Estrutura

```
specs/
├── openapi.yaml              # Contrato de API (rotas, request/response, erros)
└── schemas/
    ├── common.schema.ts       # Guarda, enums de status, erros — usados por todos
    ├── identificacao.schema.ts
    ├── chaves.schema.ts
    └── sync.schema.ts
```

No repositório final, esta pasta deve ser referenciada a partir de `/src/specs/`
(conforme exigido pelo enunciado) e os schemas Zod devem ser importados pelos
handlers de cada fatia vertical (ADR-0002), ex.:
`src/features/chaves/chaves.controller.ts` importa de
`src/specs/schemas/chaves.schema.ts`.

## Rastreabilidade (Spec → Requisito → Caso de Uso)

| Spec | RF | RN | UC / US |
|---|---|---|---|
| `POST /identificacao` | RF01 | RN02 | UC01, US-01, US-02 |
| `GET /chaves` | RF02, RF03 | — | quadro virtual |
| `GET /chaves/{codigo}` | RF02, RF03 | RN04 | detalhe/status de uma chave |
| `GET /chaves/{codigo}/historico` | RF09 | RN04 | histórico de movimentações |
| `POST /chaves/{codigo}/retirada` | RF04, RF05 | RN01, RN02, RN04, RN06 | UC02, US-05, US-07 |
| `POST /chaves/{codigo}/devolucao` | RF06 | RN03, RN05, RN06 | UC03, US-06 |
| `POST /sync` | RF07, RF08, RF10 | RN07 | UC04, US-08, US-09, US-10 |

## Nota de auditoria (2026-07-12)

Uma revisão desta spec contra o ERS encontrou e corrigiu duas divergências
antes de o time consumir estes arquivos:

1. `GET /chaves/{codigo}` prometia na descrição um "histórico resumido" que
   o schema de resposta não continha. RF09 exige histórico com responsável,
   chave e horários — isso agora é um endpoint próprio,
   `GET /chaves/{codigo}/historico`, que retorna a lista de `Movimentacao`.
2. Os erros 409 de retirada bloqueada (RN01) e devolução bloqueada (RN05)
   compartilhavam o mesmo `example` genérico do schema `ErroConflito`. Cada
   rota agora tem um exemplo de resposta próprio (`CHAVE_JA_EM_USO` vs.
   `CHAVE_JA_DISPONIVEL`), evitando confundir os dois cenários na documentação
   gerada (Swagger UI/Redoc).

Fora esses dois pontos, a cobertura foi conferida requisito a requisito:
todo RF01–RF10 e RN01–RN07 aparece em pelo menos uma rota; RF10 (indicador
visual offline) e RN08 (validação institucional da assinatura) foram
deliberadamente deixados fora da API por serem, respectivamente, estado de
UI local no dispositivo e uma pendência institucional, não um contrato
técnico de servidor.

## Decisões técnicas refletidas nas specs

- **RN01/RN05 como HTTP 409, não 400.** Retirar uma chave em uso ou devolver
  uma chave disponível não é um erro de formato do payload — é um conflito de
  estado de negócio. Por isso `ErroConflito` é um schema próprio, distinto de
  `ErroPadrao`, e inclui `responsavelAtual` para a UI poder exibir quem está
  com a chave (US-07: "o aviso inclui o nome do responsável atual").
- **`deviceId` obrigatório em toda movimentação.** Existe puramente para
  suportar idempotência na sincronização (FE-04 do UC04: reenvio após queda
  de conexão não pode duplicar registro).
- **`/sync` nunca retorna sucesso genérico de lote.** Retorna um resultado por
  item (`sincronizado` / `conflito` / `erro`), porque o RVS e o UC04 exigem
  que sincronização parcial (FA-03) e conflitos (FA-02) sejam visíveis
  individualmente — um `200 OK` único esconderia exatamente o risco que a
  ADR-0006 já assume (perda silenciosa de dados sob LWW).
- **Validação de forma (Zod) é separada de validação de regra de negócio.**
  Os schemas aqui garantem que o payload tem o formato certo (tipos, enums,
  padrão `Bloco/Sala`). Eles **não** decidem se uma retirada é permitida —
  isso é responsabilidade das `CheckoutStrategy` / `ReturnStrategy` definidas
  na ADR-0009. Essa separação é o que permite ao Harness (próxima etapa) rodar
  o typecheck e os testes de contrato *antes* de sequer instanciar as regras
  de negócio.

## Como isso alimenta o AI Harness (Feedforward)

Estes dois arquivos (`openapi.yaml` + `schemas/*.ts`) são o material que deve
ser injetado no prompt/contexto do agente de IA antes de gerar qualquer
handler. Um prompt de geração de código deve, no mínimo, referenciar:

1. O endpoint exato do `openapi.yaml` (método, path, request, responses).
2. O schema Zod correspondente, para que o agente **importe e reutilize**
   em vez de recriar tipos "parecidos".
3. A ADR-0009 (Strategy/Observer), para que a lógica de RN01/RN05 não seja
   escrita como `if/else` solto dentro do controller.

## Próximo passo pendente

Falta o **AI Harness** propriamente dito (Feedback): pipeline
lint → typecheck → testes automatizados rodando sobre o código gerado a
partir destas specs. Este README cobre apenas o lado "Specs" da entrega.

## Decisões técnicas refletidas nas specs

- **RN01/RN05 como HTTP 409, não 400.** Retirar uma chave em uso ou devolver
  uma chave disponível não é um erro de formato do payload — é um conflito de
  estado de negócio. Por isso `ErroConflito` é um schema próprio, distinto de
  `ErroPadrao`, e inclui `responsavelAtual` para a UI poder exibir quem está
  com a chave (US-07: "o aviso inclui o nome do responsável atual").
- **`deviceId` obrigatório em toda movimentação.** Existe puramente para
  suportar idempotência na sincronização (FE-04 do UC04: reenvio após queda
  de conexão não pode duplicar registro).
- **`/sync` nunca retorna sucesso genérico de lote.** Retorna um resultado por
  item (`sincronizado` / `conflito` / `erro`), porque o RVS e o UC04 exigem
  que sincronização parcial (FA-03) e conflitos (FA-02) sejam visíveis
  individualmente — um `200 OK` único esconderia exatamente o risco que a
  ADR-0006 already assume (perda silenciosa de dados sob LWW).
- **Validação de forma (Zod) é separada de validação de regra de negócio.**
  Os schemas aqui garantem que o payload tem o formato certo (tipos, enums,
  padrão `Bloco/Sala`). Eles **não** decidem se uma retirada é permitida —
  isso é responsabilidade das `CheckoutStrategy` / `ReturnStrategy` definidas
  na ADR-0009. Essa separação é o que permite ao Harness (próxima etapa) rodar
  o typecheck e os testes de contrato *antes* de sequer instanciar as regras
  de negócio.

## Como isso alimenta o AI Harness (Feedforward)

Estes dois arquivos (`openapi.yaml` + `schemas/*.ts`) são o material que deve
ser injetado no prompt/contexto do agente de IA antes de gerar qualquer
handler. Um prompt de geração de código deve, no mínimo, referenciar:

1. O endpoint exato do `openapi.yaml` (método, path, request, responses).
2. O schema Zod correspondente, para que o agente **importe e reutilize**
   em vez de recriar tipos "parecidos".
3. A ADR-0009 (Strategy/Observer), para que a lógica de RN01/RN05 não seja
   escrita como `if/else` solto dentro do controller.

## Próximo passo pendente

Falta o **AI Harness** propriamente dito (Feedback): pipeline
lint → typecheck → testes automatizados rodando sobre o código gerado a
partir destas specs. Este README cobre apenas o lado "Specs" da entrega.