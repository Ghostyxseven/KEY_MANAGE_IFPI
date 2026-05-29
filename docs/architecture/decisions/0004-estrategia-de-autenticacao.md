# ADR 0004 — Estratégia de Autenticação

**Status:** Accepted  
**Data:** 2026-05-28  
**Time:** CoreTech  
**Projeto:** Sistema de Gerenciamento de Acesso a Chaves — IFPI Campus Piripiri

---

## Contexto

O MVP precisa identificar o guarda responsável pelas operações de retirada e devolução de chaves, substituindo a assinatura física no caderno. Toda operação deve estar vinculada a um responsável rastreável (RF01, RN02, RN08).

Há duas abordagens consideradas:

- **Identity-as-a-Service (Firebase Auth, Auth0, Supabase Auth):** soluções gerenciadas que oferecem fluxos completos de autenticação (login, reset de senha, verificação de e-mail, tokens JWT). Reduzem esforço operacional, mas exigem conexão com servidores externos — incompatível com o requisito de operação offline plena (RF07, RNF03).
- **Identificação simplificada local (nome + matrícula):** o guarda informa nome completo e número de matrícula na tela inicial. A identificação é armazenada na sessão local do dispositivo e vinculada a cada registro de operação. Não requer senha complexa, não depende de internet e é compatível com o perfil de uso relatado pelo guarda (preferência por interfaces simples, dificuldade com computadores).

O RVS e o Documento de Requisitos do projeto definem explicitamente que **perfis de acesso diferenciados são pós-MVP** e que **o registro de nome e matrícula substitui administrativamente a assinatura física**, conforme confirmação institucional obtida na fase de viabilidade (RN08).

## Decisão

Adotamos a **identificação simplificada por nome completo e matrícula** como mecanismo de autenticação para o MVP, sem senhas complexas, sem tokens JWT e sem dependência de serviços externos de identidade.

O fluxo de identificação funciona da seguinte forma:

1. Ao abrir o aplicativo, o guarda informa nome completo e matrícula.
2. O sistema valida os campos (nome com ao menos 3 caracteres; matrícula alfanumérica obrigatória).
3. A identificação é armazenada localmente na sessão ativa do aplicativo (não persiste após encerramento).
4. Toda operação de retirada ou devolução inclui automaticamente a identificação da sessão atual.
5. Ao encerrar e reabrir o app, nova identificação é exigida.

Esta identificação funciona **completamente em modo offline**, sem qualquer requisição ao servidor.

## Consequências

- A solução é intencional para o escopo do MVP: simples, offline-first e alinhada ao perfil do usuário principal (guarda de segurança).
- **Não há verificação de validade da matrícula** no MVP — o sistema aceita qualquer combinação alfanumérica. Validação contra uma base de servidores cadastrados é classificada como pós-MVP.
- A ausência de senha não é uma falha de segurança no contexto do MVP: o sistema opera em ambiente físico controlado (guarita) e a rastreabilidade por nome/matrícula é suficiente para substituir o caderno, conforme validação institucional (RN08).
- Caso o projeto evolua para pós-MVP com perfis diferenciados (guarda, professor, direção), esta ADR deverá ser superseded por uma nova ADR que documente a adoção de autenticação baseada em JWT, Supabase Auth ou equivalente.
- Soluções de Identity-as-a-Service (Firebase Auth, Auth0, Supabase Auth) foram **explicitamente descartadas para o MVP** por exigirem conexão com servidores externos — incompatível com RNF03 (offline-first pleno).
