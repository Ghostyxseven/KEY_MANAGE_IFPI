# Plano de implementação

## Arquitetura

```text
Expo nativo/web → Firebase Authentication → Cloud Firestore
Firebase Hosting → export estático do painel/app web
```

O guarda usa um e-mail técnico determinístico derivado da matrícula, invisível na interface. O administrador mantém sua sessão principal enquanto uma instância secundária do Firebase Auth cria o guarda. Em seguida, um batch cria `usuarios/{uid}` e `acessos/{matricula}`. Se o batch falhar, o usuário Auth recém-criado é removido.

## Entregas

1. Configuração Firebase pública por ambiente e rotas protegidas por perfil.
2. Serviço de autenticação para admin e guarda.
3. Painel de cadastro, listagem, bloqueio e reativação.
4. Movimentações diretas e atômicas no Firestore com identidade canônica.
5. Security Rules, documentação, testes e build.

## Riscos tratados

- Cadastro parcial: compensação remove o usuário Auth quando o batch falha.
- Escalada de privilégio: somente admin cria perfis e somente perfis `guarda` podem ser criados pelo cliente.
- Vazamento de PIN: o PIN existe somente no Firebase Auth.
- Matrícula duplicada: documento auxiliar usa a matrícula normalizada como ID.
