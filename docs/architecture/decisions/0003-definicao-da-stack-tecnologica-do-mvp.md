# ADR 0003 — Definição da Stack Tecnológica do MVP

**Status:** Accepted  
**Data:** 2026-05-28  
**Time:** CoreTech  
**Projeto:** Sistema de Gerenciamento de Acesso a Chaves — IFPI Campus Piripiri

---

## Contexto

Definir o conjunto de linguagens, frameworks e paradigmas de banco de dados para o MVP é uma decisão de alto impacto no tempo de entrega, qualidade técnica e facilidade de manutenção. Esta decisão foi informada por entrevistas realizadas com o guarda responsável e o técnico de TI do campus em abril de 2026, que revelaram restrições concretas de infraestrutura:

- O campus sofre **quedas frequentes de internet**, inviabilizando qualquer solução 100% dependente de conexão.
- O técnico de TI **já opera um ambiente Node.js + PostgreSQL** internamente, eliminando curva de aprendizado na infraestrutura e evitando dependência de serviços externos.
- O guarda relatou **preferência por celular** e dificuldade com computadores, exigindo uma solução mobile-first.

Alternativas consideradas e descartadas:
- **Firebase (Firestore + Auth):** descartado por exigir conexão constante para autenticação e sincronização, incompatível com o requisito de operação offline plena (RF07).
- **Flutter:** descartado por ser uma tecnologia sem nenhuma familiaridade no time.
- **QR Code para identificação de chaves:** descartado pois as chaves já possuem identificadores próprios no padrão Bloco/Sala (ex.: A/S9), eliminando a necessidade de hardware adicional.

## Decisão

Adotamos a seguinte **stack macro** para o MVP:

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend Mobile** | React Native + Expo | Familiaridade com React (web) no time; Expo simplifica o ambiente de build para Android/iOS sem ejeção; suporte nativo a SQLite e NetInfo via SDK |
| **Backend / API** | Node.js + Express | Tecnologia já em uso no campus; suporte do técnico de TI disponível pontualmente; familiaridade prévia dos membros em disciplinas anteriores |
| **Banco Local (Offline)** | SQLite | Armazenamento embarcado no dispositivo; suporte nativo ao Expo (via `expo-sqlite`); ideal para operação offline-first sem dependência de rede |
| **Banco Central (Servidor)** | PostgreSQL | Infraestrutura existente no campus; sem custo adicional; banco relacional adequado ao modelo de dados de registros de retirada/devolução |

A escolha do **PostgreSQL sobre Firebase** é explicitamente justificada: além de já existir no campus, o Firebase foi descartado por exigir conexão constante para autenticação — incompatível com o requisito RF07 (operação offline plena).

## Consequências

- A stack é estável e adequada ao problema, mas a implementação do módulo offline/sincronização depende de **validação técnica prévia via POC** (spike técnico planejado para as Semanas 1–2 do cronograma).
- A equipe possui familiaridade com React para web, **mas não com React Native**. A migração introduz diferenças relevantes (ambiente Expo, APIs nativas, comportamento offline, SQLite) com curva de aprendizado estimada em 1–2 semanas produtivas — incorporada ao cronograma como spike técnico.
- A **estratégia de resolução de conflitos offline** adotada ("último timestamp vence") é uma simplificação aceita para o MVP, com limitação conhecida: em cenários de múltiplos dispositivos offline simultâneos, o registro mais antigo pode ser sobrescrito sem alerta. Esta limitação está documentada em RNF06 e RN07 do Documento de Requisitos.
- O suporte do técnico de TI do campus é uma **incerteza institucional**, não uma garantia. A equipe deve ser autossuficiente; eventuais contribuições do TI serão tratadas como recurso complementar.
- Caso o servidor do campus não seja disponibilizado para hospedagem, a equipe utilizará a plataforma **Railway** (plano gratuito para projetos acadêmicos) como fallback, mantendo o TCO total abaixo de R$ 80,00 nos primeiros 6 meses.
