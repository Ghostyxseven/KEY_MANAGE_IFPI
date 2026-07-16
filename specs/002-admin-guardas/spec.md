# Especificação: Administração de guardas sem servidor próprio

## Objetivo

Permitir que o administrador cadastre guardas no app web hospedado no Firebase Hosting e que cada guarda entre no Expo somente com matrícula e PIN de seis dígitos. O app acessa Firebase Auth e Firestore diretamente, protegido por Security Rules, sem Render, Express ou Cloud Functions.

## Histórias e critérios de aceitação

### US1 — Administrador cadastra um guarda (P1)

- Dado um administrador autenticado e ativo, quando informa nome, matrícula inédita e PIN válido, então são criados o usuário no Firebase Auth e o perfil `guarda` no Firestore.
- Um usuário não administrador não pode criar, listar, bloquear ou reativar guardas.
- O PIN nunca é gravado no Firestore.

### US2 — Guarda acessa o aplicativo (P1)

- O guarda informa somente matrícula e PIN.
- O app normaliza a matrícula, autentica no Firebase Auth e carrega nome e matrícula do perfil ativo.
- Credenciais inválidas, perfil ausente, inativo ou que não seja guarda são rejeitados sem revelar qual dado falhou.

### US3 — Administrador controla acesso (P2)

- O administrador lista guardas e pode bloquear ou reativar cada perfil.
- Um guarda bloqueado perde acesso aos documentos protegidos pelas regras.

## Requisitos não funcionais

- Firestore nega por padrão e autoriza por `request.auth.uid` e perfil ativo.
- Movimentações são imutáveis e vinculadas ao guarda autenticado.
- Configuração pública Firebase vem de `EXPO_PUBLIC_FIREBASE_*`; credenciais administrativas não entram no bundle.
- O primeiro administrador é provisionado uma única vez por ferramenta local segura.

## Fora de escopo

- Redefinição de PIN pelo painel nesta entrega.
- Criação de chaves pelo cliente.
- Backend próprio, Render ou Cloud Functions.
