# ADR 0007 — Identificação de Chaves e Ausência de Hardware Adicional

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech

## Contexto
O sistema precisa garantir que cada chave física do campus seja identificada de forma única e inequívoca nas rotinas de retirada e devolução. Avaliamos abordagens de automação de leitura por imagem, como a geração e colagem de etiquetas contendo **QR Codes** (demandando bibliotecas de câmera no app), ou o uso de tags físicas de proximidade **NFC/RFID**, que demandam a aquisição de hardware dedicado e encarecem o projeto.

## Decisão
Adotamos o **padrão de identificação alfanumérico visual já consolidado e utilizado no campus** (ex: bloco/sala como `A/S9`). O MVP funcionará **sem QR Code, NFC ou qualquer hardware adicional**. A seleção será feita pelo guarda através do toque direto em um quadro virtual interativo no aplicativo mobile.

## Consequências
- **Positivas:** Custo financeiro zero com aquisição de insumos, etiquetas ou dispositivos leitores. Elimina a curva de aprendizado dos guardas, que já reconhecem e operam com esses códigos exatos no dia a dia, e simplifica significativamente o escopo técnico de desenvolvimento do app.
- **Negativas / Trade-offs:** Transfere a carga de trabalho para um **processo massivo e manual de cadastro inicial** de dados no banco (carga de matriz de salas). Além disso, gera **rigidez e acoplamento estrito da identidade dos itens**: caso o campus mude o nome físico de uma sala, o código se torna imutável no banco do MVP, exigindo scripts manuais de migração de dados no SQLite local para evitar a quebra de referências históricas.