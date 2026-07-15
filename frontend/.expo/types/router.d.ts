/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/historico` | `/(tabs)/quadro` | `/_sitemap` | `/historico` | `/identificacao` | `/quadro`;
      DynamicRoutes: `/devolucao/${Router.SingleRoutePart<T>}` | `/historico/${Router.SingleRoutePart<T>}` | `/retirada/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/devolucao/[codigo]` | `/historico/[codigo]` | `/retirada/[codigo]`;
    }
  }
}
