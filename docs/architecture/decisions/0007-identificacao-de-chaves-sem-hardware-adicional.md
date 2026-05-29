# ADR 0007 — Identificação de Chaves e Ausência de Hardware Adicional

**Status:** Accepted  
**Data:** 2026-05-28  
**Time:** CoreTech  
**Projeto:** Sistema de Gerenciamento de Acesso a Chaves — IFPI Campus Piripiri

---

## Contexto

O sistema precisa identificar cada chave de forma única e inequívoca para vincular registros de retirada e devolução ao item correto. Isso é essencial para substituir o caderno físico com rastreabilidade equivalente ou superior (RF02, RN04).

Alternativas consideradas para identificação das chaves:

- **QR Code (etiquetas nas chaves, leitura via câmera do celular):** permite identificação automática sem digitação, mas exige impressão e adesivagem de etiquetas em cada chave, manutenção das etiquetas (desgaste, substituição) e implementação da câmera no app. Introduz hardware adicional e complexidade de setup.
- **NFC / RFID (tags eletrônicas):** identificação por aproximação, mais robusta que QR Code. Exige hardware específico (tags NFC, leitores) e infraestrutura de custo incompatível com o contexto acadêmico.
- **Código alfanumérico existente (padrão Bloco/Sala):** as chaves já possuem identificadores próprios gravados ou afixados, no padrão já utilizado pelo campus (ex.: A/S9 para Sala 9 do Bloco A, L/B2 para Laboratório B2). Nenhum hardware adicional é necessário — o guarda seleciona a chave no quadro visual pelo código que já conhece.

A entrevista com o guarda (abril/2026) confirmou que o padrão de codificação existente já é compreendido e utilizado no dia a dia, não representando curva de aprendizado.

## Decisão

Adotamos o **padrão de identificação alfanumérico já utilizado no campus** (ex.: A/S9, L/B2) como identificador único de cada chave no sistema, **sem QR Code, NFC ou qualquer hardware adicional** no MVP.

O quadro virtual de chaves (RF02, RF03) exibirá cada chave pelo seu código existente, com indicador visual de status por cor (verde = disponível, vermelho = em uso). A seleção da chave pelo guarda é feita com toque direto no quadro — sem necessidade de câmera ou leitura automática.

## Consequências

- **Custo zero de hardware:** nenhuma etiqueta, tag ou leitor adicional precisa ser adquirido ou instalado. O sistema é compatível com o inventário físico existente sem modificações.
- O cadastro inicial das chaves no sistema (lista de códigos e descrições) precisará ser realizado **uma única vez** antes do deploy. Este cadastro deverá ser confirmado na entrevista final com o guarda e a gestão (pendência documentada na Seção 11.2 do DR: quantas chaves existem e qual o padrão exato em uso).
- **QR Code foi descartado do MVP** por criar dependência de hardware (etiquetas) e adicionar complexidade de implementação (permissão de câmera, biblioteca de leitura QR) sem benefício proporcional — dado que o guarda já conhece os códigos existentes.
- Caso o campus expanda o sistema para múltiplos campi ou precise de identificação automática sem digitação (ex.: autoatendimento por professores), a adoção de QR Code ou NFC poderá ser documentada em uma ADR de pós-MVP.
- O padrão de código deve ser tratado como **imutável durante o MVP**: renomear chaves após o cadastro exigiria migração de dados no SQLite local de todos os dispositivos.
