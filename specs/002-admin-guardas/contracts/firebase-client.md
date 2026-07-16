# Contrato do cliente Firebase

- `entrarGuarda(matricula, pin)` retorna perfil ativo `guarda` ou erro genérico de credencial.
- `entrarAdministrador(email, senha)` retorna perfil ativo `admin` ou erro genérico.
- `cadastrarGuarda(nome, matricula, pin)` requer admin autenticado, matrícula inédita e PIN numérico de seis dígitos.
- `listarGuardas()` e `alterarStatusGuarda()` requerem admin ativo.
- Retirada/devolução requerem guarda ativo e gravam `autorUid` igual ao UID autenticado.
