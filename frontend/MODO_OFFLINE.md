# 📴 Modo Offline - CoreTech Chaves

## Funcionalidades Implementadas

Este aplicativo agora funciona **offline** com as seguintes capacidades:

### 1. Cache de Dados
- **Chaves**: Os dados das chaves são armazenados em cache automaticamente quando você está online
- **Persistência**: Mesmo se fechar o app, os dados permanecem salvos no dispositivo

### 2. Operações Offline
Quando estiver sem conexão:
- ✅ Visualizar chaves (dados em cache)
- ✅ Retirar chaves (registro pendente de sincronização)
- ✅ Devolver chaves (registro pendente de sincronização)
- ⚠️ Histórico pode não estar disponível se nunca foi carregado antes

### 3. Sincronização Automática
- Quando a conexão for restabelecida, todas as operações pendentes serão sincronizadas automaticamente
- O app verifica o status da conexão a cada 5 segundos

## Como Funciona

### Estrutura de Armazenamento

```typescript
// services/storage.ts
- AsyncStorage: Armazena dados localmente no dispositivo
- expo-network: Detecta status da conexão de rede
```

### Fluxo Offline

1. **Sem Internet**:
   - App carrega dados do cache
   - Operações de retirada/devolução são salvas como "pendentes"
   - UI mostra banner amarelo: "📴 Modo Offline - Dados em cache"

2. **Com Internet Restaurada**:
   - App detecta automaticamente a conexão
   - Sincroniza todas as operações pendentes com o servidor
   - Atualiza o cache com dados mais recentes

## Instalação das Dependências

```bash
cd frontend
npm install
```

### Dependências Adicionais para Offline
- `@react-native-async-storage/async-storage`: Armazenamento local
- `expo-network`: Detecção de status de rede

## Testando o Modo Offline

### No Expo Go (Celular)
1. Inicie o app: `npm start`
2. Escaneie o QR code com Expo Go
3. Coloque o celular em modo avião
4. O app continuará funcionando com dados em cache

### No Emulador/Simulador
1. Inicie o emulador
2. Desative a rede nas configurações do emulador
3. O app mostrará o banner de modo offline

### Desenvolvimento Web
⚠️ **Nota**: O modo offline no navegador tem limitações:
- AsyncStorage usa localStorage do navegador
- Network detection pode não funcionar em todos os navegadores
- Para melhor experiência offline, use o app nativo (Android/iOS)

## Limitações

1. **Primeiro Acesso**: Precisa de internet para carregar os dados iniciais
2. **Conflitos**: Se dois dispositivos fizerem operações na mesma chave offline, pode haver conflito na sincronização
3. **Histórico**: Só estará disponível offline se já tiver sido carregado anteriormente

## Dicas de Uso

- ✅ Sempre abra o app quando tiver internet para atualizar o cache
- ✅ Verifique o banner amarelo para saber se está offline
- ✅ As operações feitas offline terão `syncStatus: "pending"` até serem sincronizadas

## Próximos Passos (Sugestões)

- [ ] Adicionar botão manual para sincronizar
- [ ] Mostrar contador de operações pendentes
- [ ] Implementar resolução de conflitos mais sofisticada
- [ ] Adicionar notificação quando sincronização falhar
