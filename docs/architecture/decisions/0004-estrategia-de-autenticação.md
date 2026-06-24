# ADR 0004 — Estratégia de Autenticação

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech

## Contexto
O fluxo de autenticação do sistema precisa atender aos guardas do campus de forma ágil, funcionando perfeitamente sem conectividade com a internet. Sistemas tradicionais de autenticação centralizada exigem grande esforço de desenvolvimento (redefinição de senhas, rotinas complexas de hash, criptografia e fluxos de MFA). Considerou-se o uso de soluções de Identity-as-a-Service (IdAaS) em nuvem, como Firebase Auth ou Auth0, versus o desenvolvimento de uma autenticação customizada local.

## Decisão
Adotamos uma estratégia simplificada de **identificação local baseada em `nome` e `matrícula`** diretamente no dispositivo SQLite do guarda, sem senha ou fluxos de recuperação complexos no escopo do MVP. A lógica será isolada na pasta `src/adapters/auth/` para facilitar futuras expansões.

## Consequências
- **Positivas:** Elimina completamente o tempo de desenvolvimento gasto com infraestrutura de segurança complexa e mitiga o risco de vulnerabilidades críticas de vazamento de credenciais no MVP. Reduz a barreira de uso e treinamento dos operadores, permitindo o login 100% desconectado da rede.
- **Negativas / Trade-offs:** Fragiliza a segurança geral do sistema no ambiente local, visto que a ausência de senha permite que qualquer pessoa com acesso físico ao dispositivo personifique um operador. Inviabiliza recursos como auditoria centralizada em tempo real, revogação imediata de sessões ativas e controle de acesso baseado em papéis (RBAC) sofisticados, postergando estes riscos aceitos para fases pós-MVP.