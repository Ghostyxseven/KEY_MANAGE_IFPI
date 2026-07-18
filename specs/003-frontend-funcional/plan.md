# Plano: Frontend funcional e responsivo

## Contexto técnico

- Expo Router e React Native com TypeScript para Android e web.
- Componentes compartilhados em `frontend/src/presentation/components` e tema central.
- Firebase e AsyncStorage permanecem como integrações existentes.

## Constituição

- Preservar contratos, dados offline, limites de segurança e Expo Router.
- Lint, typecheck, testes e export web são gates obrigatórios.

## Estratégia

1. Expandir tokens e componentes compartilhados.
2. Padronizar navegação, títulos, largura e ações.
3. Refinar autenticação e operações do guarda.
4. Refinar painel e operações administrativas.
5. Padronizar histórico, auditoria, pendências e estados vazios.
6. Corrigir codificação e validar responsividade e gates.

## Riscos

- Preservar handlers e serviços reduz regressão funcional.
- APIs multiplataforma evitam diferenças web/Android.
- Largura máxima, espaçamento compacto e alvos de toque preservam o uso móvel.
