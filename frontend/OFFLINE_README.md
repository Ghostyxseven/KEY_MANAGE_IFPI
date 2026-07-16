# Funcionalidades Offline - CoreTech Chaves

## Visão Geral

O aplicativo agora funciona completamente **offline**, permitindo que os guardas realizem retiradas e devoluções de chaves mesmo sem conexão com a internet. Os dados são sincronizados automaticamente quando a conexão é restabelecida.

## Como Funciona

### 1. Detecção de Conexão
- O aplicativo monitora o status da rede a cada 5 segundos
- Um banner amarelo é exibido no topo da tela quando offline
- O ícone 📴 indica claramente o modo offline

### 2. Cache de Dados
- **Chaves**: A lista de chaves é armazenada localmente após o primeiro carregamento
- Quando offline, o aplicativo exibe os dados em cache
- Alerta informativo é mostrado ao usar dados cacheados

### 3. Operações Offline

#### Retirada de Chave
```typescript
// Quando offline, a operação é salva localmente
await api.retirarChave(codigo, payload);
// Retorna resposta simulada para a UI funcionar normalmente
```

#### Devolução de Chave
```typescript
// Quando offline, a operação é salva localmente
await api.devolverChave(codigo, payload);
// Retorna resposta simulada para a UI funcionar normalmente
```

### 4. Sincronização Automática
- As operações pendentes são armazenadas em fila
- Ao recuperar a conexão, `api.sincronizarPendencias()` é chamada
- Operações são enviadas na ordem em que foram realizadas
- Em caso de falha, a operação permanece na fila para nova tentativa

## Estrutura de Armazenamento

### AsyncStorage Keys
- `@coretech:chaves_cache`: Lista de chaves em cache
- `@coretech:movimentacoes_pending`: Fila de operações pendentes

### Tipo MovimentacaoPending
```typescript
{
  chaveCodigo: string;           // Código da chave (ex: A1, S5)
  tipo: 'retirada' | 'devolucao'; // Tipo da operação
  payload: {
    responsavel: {               // Dados do responsável
      nome: string;
      matricula: string;
    };
    timestampLocal: string;      // Data/hora ISO da operação
    deviceId: string;            // ID único do dispositivo
  };
}
```

## Arquivos Modificados

### Serviços
- **`frontend/src/services/storage.ts`**
  - Gerencia armazenamento local e detecção de rede
  - Comentários em português com padrão JSDoc

- **`frontend/src/services/api.ts`**
  - Implementa lógica offline nas operações de retirada/devolução
  - Método `sincronizarPendencias()` para sync automático
  - Comentários detalhados em português

### Telas
- **`frontend/app/(tabs)/quadro.tsx`**
  - Exibe banner de status offline
  - Monitora conexão periodicamente
  - Carrega dados do cache quando necessário

- **`frontend/app/_layout.tsx`**
  - Layout principal com navegação stack

- **`frontend/app/(tabs)/_layout.tsx`**
  - Layout de abas (Chaves e Histórico)

- **`frontend/app/identificacao.tsx`**
  - Tela de identificação do usuário

- **`frontend/app/index.tsx`**
  - Redirecionamento para tela principal

## Padrão de Comentários

Todos os arquivos seguem o padrão:
- **Tipos**: Comentário inline descrevendo cada campo
- **Funções/Métodos**: JSDoc com descrição, @params e @returns
- **Variáveis de estado**: Comentário inline explicando o propósito
- **Componentes**: JSDoc descrevendo funcionalidade e retorno

Exemplo:
```typescript
/**
 * Serviço de armazenamento local e gerenciamento de conexão.
 * Responsável por cachear dados e gerenciar operações offline.
 */
export const storage = {
  /**
   * Verifica o status atual da conexão de rede.
   * @returns Objeto com status de conexão e modo offline
   */
  async getNetworkStatus(): Promise<{ isConnected: boolean; isOffline: boolean }> {
    // ...
  }
};
```

## Testando o Modo Offline

1. **Simular Offline no Dispositivo**:
   - Ative o modo avião
   - Desative WiFi e dados móveis

2. **Comportamento Esperado**:
   - Banner amarelo aparece no topo
   - Lista de chaves carrega do cache
   - Retiradas/devoluções funcionam normalmente
   - Operações ficam na fila de sincronização

3. **Restaurar Conexão**:
   - Desative o modo avião
   - Aguarde alguns segundos
   - Operações pendentes são sincronizadas automaticamente

## Considerações Importantes

⚠️ **Limitações Offline**:
- Histórico completo só está disponível online
- Validações do servidor são feitas apenas na sincronização
- Conflitos podem ocorrer se a mesma chave foi modificada em outro dispositivo

✅ **Vantagens**:
- Operação contínua sem interrupções
- Dados não são perdidos durante queda de conexão
- Sincronização transparente para o usuário

## Próximos Passos (Sugestões)

1. Adicionar retry exponencial para falhas de sincronização
2. Implementar resolução de conflitos mais sofisticada
3. Adicionar indicador visual de operações pendentes
4. Criar tela de histórico local de operações offline
