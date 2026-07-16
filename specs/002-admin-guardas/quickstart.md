# Validação rápida

1. Copie `frontend/.env.example` para `frontend/.env.local` e configure o Firebase.
2. Habilite o provedor E-mail/senha no Firebase Authentication.
3. Provisione o primeiro admin com `npm run provision:admin`.
4. Execute `npm run emulators:start` para validação local ou `npm --prefix frontend start` para o projeto configurado.
5. Acesse `/admin`, entre como admin e cadastre um guarda.
6. Saia e confirme o acesso do guarda usando somente matrícula e PIN.
7. Execute `npm run verify:all` e `npx expo-doctor` dentro de `frontend`.
