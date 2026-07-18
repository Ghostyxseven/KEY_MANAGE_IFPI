# Especificação: Frontend funcional e responsivo

## Objetivo

Transformar todas as telas do Controle de Chaves em uma experiência única, clara e operacional no celular e na web, sem alterar as regras de autenticação, segurança, movimentação ou sincronização existentes.

## Histórias e critérios de aceitação

### US1 — Guarda movimenta chaves com segurança (P1)

- O guarda identifica chaves disponíveis e em uso, pesquisa e filtra a lista.
- Retirada, devolução e histórico possuem ações claras, confirmação e feedback.
- Telas representam carregamento, vazio, modo offline e conflito sem parecerem travadas.
- A navegação permanece utilizável em telas pequenas.

### US2 — Administrador opera o sistema (P1)

- O painel apresenta indicadores e atalhos para guardas, chaves e auditoria.
- Listas administrativas permitem pesquisar, cadastrar, editar, arquivar, bloquear e reativar.
- Formulários diferenciam criação e edição, validam entradas e impedem envios repetidos.
- Ações destrutivas ou de bloqueio exigem confirmação explícita.

### US3 — Operador entende o estado do sistema (P2)

- Histórico, pendências e auditoria mostram contexto, data, responsável e estado.
- Estados vazios explicam o ocorrido e oferecem uma próxima ação quando aplicável.
- Mensagens e rótulos aparecem em português correto, sem caracteres corrompidos.

## Requisitos funcionais

- **FR-001**: Todas as telas MUST usar hierarquia consistente para título, contexto, conteúdo e ações.
- **FR-002**: Toda coleção remota MUST representar carregamento, vazio, erro e conteúdo.
- **FR-003**: Toda ação assíncrona MUST impedir repetição enquanto estiver em andamento e apresentar resultado.
- **FR-004**: Navegação e ações principais MUST funcionar em web e Android, respeitando o perfil.
- **FR-005**: Busca e filtros MUST informar resultados visíveis e permitir limpeza rápida.
- **FR-006**: Estados MUST usar rótulos textuais além de cor.
- **FR-007**: Formulários MUST apresentar validação e ação de cancelamento quando editáveis.
- **FR-008**: Confirmações MUST funcionar no navegador e no Android.
- **FR-009**: O frontend MUST preservar cache, pendências e conflitos até confirmação ou descarte explícito.
- **FR-010**: Todo texto visível MUST estar corretamente codificado em português.
- **FR-011**: O layout MUST funcionar entre 320 px e desktop sem rolagem horizontal.
- **FR-012**: Controles MUST expor função, estado desabilitado e área de toque adequada.
- **FR-013**: Toda retirada MUST registrar o nome do aluno, aceitar matrícula opcional e reutilizar essa identificação na devolução sem novo preenchimento.
- **FR-014**: No APK Android, pendências MUST pertencer ao UID que as criou e ter sincronização periódica em segundo plano quando o sistema permitir rede e execução.

## Casos extremos

- Lista remota vazia ou indisponível sem cache.
- Código de chave contendo espaço, barra, hífen ou caracteres acentuados.
- Conectividade perdida durante movimentação ou sincronização.
- Sessão expirada em tela protegida.
- Lista extensa, texto longo e teclado aberto em tela pequena.
- Toque repetido durante operação assíncrona.

## Critérios mensuráveis

- **SC-001**: O operador encontra uma chave e inicia a ação adequada em até três interações.
- **SC-002**: Todas as rotas representam estado útil quando não há conteúdo disponível.
- **SC-003**: Nenhuma ação assíncrona é enviada duas vezes pelo mesmo controle durante processamento.
- **SC-004**: Ações essenciais permanecem acessíveis em 320 px sem rolagem horizontal.
- **SC-005**: Nenhum texto visível apresenta caracteres corrompidos.
- **SC-006**: Lint, typecheck, testes e build terminam sem erros.

## Premissas

- A identidade institucional azul, dourado e branco será preservada e refinada.
- Firebase, regras de segurança e estratégia offline permanecem canônicos.
- O trabalho cobre todas as rotas existentes, sem novas entidades ou permissões.

## Fora de escopo

- Alterar autenticação ou autorização.
- Substituir Firebase ou Expo Router.
- Criar funções administrativas fora das rotas existentes.
