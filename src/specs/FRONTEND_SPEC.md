# Frontend Spec — CoreTech Chaves
# Versão: 1.0
# Status: Draft para validação
# Fonte: PRD, ERS, RVS, controllers existentes, regras RN01/RN03/RN05/RN07

---

## 1. Objetivo

Definir o contrato de interface do aplicativo mobile offline-first usado pelo guarda da guarita para retirar e devolver chaves, operando a partir dos mesmos contratos do backend já definidos em `src/specs/openapi.yaml` e nos schemas do projeto.

---

## 2. Escopo da interface

### 2.1 Incluído no MVP

- Identificação do guarda por nome e matrícula.
- Quadro virtual de chaves com status visual.
- Registro de retirada com bloqueio local quando a chave já está em uso.
- Registro de devolução com bloqueio local quando a chave já está disponível.
- Indicador de modo offline.
- Histórico local por chave.
- Sincronização automática ao recuperar conexão.

### 2.2 Fora do escopo

- Perfis diferenciados.
- Dashboard gerencial.
- Notificações push.
- QR Code / NFC.

---

## 3. Telas e contratos

### 3.1 Identificação

**Rota:** `/identificacao`
**Endpoint correspondente:** `POST /v1/identificacao`

**Campos de entrada:**
- `nome`: string, obrigatório.
- `matricula`: string, obrigatória.

**Comportamento:**
- Se offline, o app deve manter a sessão localmente e seguir para o quadro de chaves.
- O app não deve bloquear o uso por falta de conexão.

**Critérios de aceitação:**
- Usuário chega à tela e consegue se identificar em até 3 toques.
- Campos inválidos são destacados antes do envio.

### 3.2 Quadro de chaves

**Rota:** `/quadro`
**Endpoint correspondente:** `GET /v1/chaves`

**Campos de entrada:**
- Nenhum obrigatório.

**Comportamento:**
- Listar todas as chaves disponíveis.
- Mostrar status visual:
  - disponivel: verde
  - em_uso: vermelho
- Quando offline, exibir dados do cache local.
- Quando online, atualizar a partir do backend.
- Indicar explicitamente quando houver registros pendentes de sincronização.

**Critérios de aceitação:**
- O guarda consegue distinguir chaves disponíveis e em uso sem precisar ler texto.
- O app continua legível mesmo sem internet.

### 3.3 Retirada

**Rota:** `/retirada/:codigo`
**Endpoint correspondente:** `POST /v1/chaves/:codigo/retirada`

**Campos de entrada:**
- `chaveCodigo`: string, proveniente da rota.
- `responsavel.nome`: string, obrigatório.
- `responsavel.matricula`: string, obrigatória.
- `timestampLocal`: preenchido automaticamente com o horário do dispositivo.
- `deviceId`: preenchido automaticamente.

**Comportamento:**
- Validar formato `A/S9` antes de enviar.
- Se o backend retornar `409`, exibir a mensagem `CHAVE_JA_EM_USO` e impedir nova tentativa.
- Registrar localmente antes/durante envio para garantir operação offline.

**Critérios de aceitação:**
- Retirada duplicada da mesma chave é bloqueada.
- Campos obrigatórios não são deixados vazios.

### 3.4 Devolução

**Rota:** `/devolucao/:codigo`
**Endpoint correspondente:** `POST /v1/chaves/:codigo/devolucao`

**Campos de entrada:**
- `chaveCodigo`: string, proveniente da rota.
- `responsavel.nome`: string, obrigatório.
- `responsavel.matricula`: string, obrigatória.
- `timestampLocal`: preenchido automaticamente.
- `deviceId`: preenchido automaticamente.

**Comportamento:**
- Se o backend retornar `409`, exibir `CHAVE_JA_DISPONIVEL`.
- Atualizar status local para `disponivel` após sucesso.

**Critérios de aceitação:**
- Devolução de chave já disponível é bloqueada.

### 3.5 Histórico local

**Rota:** `/historico/:codigo`
**Endpoint correspondente:** `GET /v1/chaves/:codigo/historico`

**Campos de entrada:**
- `chaveCodigo`: string.

**Comportamento:**
- Mostrar lista de movimentações locais ordenadas por horário decrescente.
- Permitir consulta mesmo offline.

### 3.6 Indicador de sincronização

**Comportamento global:**
- Exibir aviso quando o app estiver offline.
- Exibir contador de registros pendentes de sincronização.
- Não impedir ações por causa do status de sincronização.

---

## 4. Regras de negócio no frontend

### 4.1 RN01 — bloqueio de retirada duplicada

- O app deve impedir retirada se a chave estiver `em_uso`.
- Esta checagem deve acontecer antes do envio ao backend e novamente após resposta do backend.

### 4.2 RN05 — bloqueio de devolução indevida

- O app deve impedir devolução se a chave já estiver `disponivel`.

### 4.3 RN04 — código de chave

- Usar validação `A/S9` no frontend antes de enviar ao backend.

### 4.4 RN07 — sincronização

- Sincronizar lote pendente ao recuperar conexão.
- Manter registro local mesmo em caso de conflito; o backend decide o vencedor por último timestamp.

---

## 5. Integração com backend

### 5.1 Base URL

```
https://us-central1-coretech-chaves.cloudfunctions.net/api/v1
```

### 5.2 Endpoints usados

| Método | Rota | Uso no frontend |
|--------|------|----------------|
| POST | `/v1/identificacao` | Tela de identificação |
| GET | `/v1/chaves` | Quadro de chaves |
| GET | `/v1/chaves/:codigo` | Detalhe de chave |
| GET | `/v1/chaves/:codigo/historico` | Histórico por chave |
| POST | `/v1/chaves/:codigo/retirada` | Retirada |
| POST | `/v1/chaves/:codigo/devolucao` | Devolução |
| POST | `/v1/sync` | Sincronização automática |

### 5.3 Payloads

**Identificação:**
```json
{
  "nome": "string",
  "matricula": "string"
}
```

**Retirada / Devolução:**
```json
{
  "responsavel": {
    "nome": "string",
    "matricula": "string"
  },
  "timestampLocal": "string",
  "deviceId": "string"
}
```

**Sync:**
```json
{
  "deviceId": "string",
  "registros": [
    {
      "id": "string",
      "chaveCodigo": "A/S9",
      "tipo": "retirada",
      "responsavel": {
        "nome": "string",
        "matricula": "string"
      },
      "timestampLocal": "string",
      "deviceId": "string",
      "syncStatus": "pendente"
    }
  ]
}
```

---

## 6. Estados e dados locais

### 6.1 Estado da aplicação

- `sessao`: `{ nome, matricula, iniciadaEm } | null`
- `chaves`: `Chave[]`
- `offline`: `boolean`
- `sincronizando`: `boolean`
- `pendentesSync`: `Movimentacao[]`

### 6.2 Persistência local

- Usar cache nativo do Firestore no cliente para manter `chaves` e `movimentacoes`.
- Nunca exigir rede para abrir o app ou registrar movimentações.

### 6.3 Validação local

- Validar `nome` e `matricula` antes de enviar.
- Validar código da chave antes de abrir tela de retirada/devolução.

---

## 7. Critérios de aceitação globais

- O app abre e funciona em modo offline.
- Retirada bloqueada quando chave já está em uso.
- Devolução bloqueada quando chave já está disponível.
- Sincronização acontece automaticamente ao recuperar conexão.
- Histórico local acessível sem internet.
- Interface compreensível para usuário sem perfil técnico.

---

## 8. Rastreabilidade

| Especificação | RF/RN/UC/US |
|---------------|-------------|
| Identificação | RF01, RN02, UC01, US01 |
| Quadro de chaves | RF02, RF03, UC01 |
| Retirada | RF04, RF05, RN01, RN02, RN04, RN06, UC02 |
| Devolução | RF06, RN03, RN05, UC03 |
| Histórico | RF09, UC02, UC03 |
| Offline | RF07, RNF03, US05 |
| Sincronização | RF08, RN07, RNF05, UC04 |
| Indicador offline | RF10, US07 |
