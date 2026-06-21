# ADR 0002 — Escolha do Estilo e Organização de Código

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech

## Contexto
O time possui o prazo estrito de um semestre acadêmico para entregar um MVP funcional e testável. Avaliamos duas abordagens de organização de código a nível médio: a tradicional **Arquitetura em Camadas (Horizontal)**, que segrega os arquivos por tipo técnico (controllers, services, repositories), e a **Arquitetura por Fatias de Contexto (Vertical Slice Architecture / Feature-Based)**, que agrupa todo o código acoplado a uma funcionalidade ou domínio de negócio específico em uma única pasta. 

## Decisão
Adotamos a **Arquitetura por Fatias de Contexto (Vertical Slice / Feature-Based)**. O código será organizado em torno de recursos de negócio (ex: a pasta `src/features/chaves/` conterá o handler, service, model e os testes específicos daquela tela). A decisão justifica-se pela velocidade de entrega de features *end-to-end* e pela facilidade de isolar responsabilidades claras de desenvolvimento em um time pequeno e multidisciplinar.

## Consequências
- **Positivas:** Acelera o desenvolvimento paralelo, permitindo que membros trabalhem em fatias diferentes com risco quase nulo de conflitos de mesclagem (merge conflicts). Reduz o custo cognitivo de navegação no código e co-localiza os testes automatizados, facilitando o feedback rápido da aplicação.
- **Negativas / Trade-offs:** Eleva severamente o risco de duplicação de código e lógica de negócios entre fatias distintas (ex: funções utilitárias ou validações duplicadas). Exige maior rigor e esforço analítico para identificar o momento exato de extrair códigos comuns. Além disso, quebra o isolamento estrito das camadas tradicionais, permitindo que alterações em uma funcionalidade exijam modificações verticais que cruzam da interface ao banco de dados.