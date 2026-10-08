# Magic: The Gathering — Commander

Pesquisa verificada em **03/10/2026**. Base normativa: **Comprehensive Rules vigentes desde 25/09/2026**. Formato de referência: Commander multiplayer, todos contra todos, quatro jogadores. O material também explica as diferenças relevantes quando a partida começa com apenas duas pessoas.

Abra **ABRA-AQUI.html** com dois cliques. Tudo funciona localmente, sem instalação, conta ou servidor. O portal dá acesso ao guia em português, à pesquisa das regras oficiais e ao laboratório de turnos e pilha.

## O que está na pasta

| Caminho | Uso |
| --- | --- |
| `guia/GUIA-PARA-IMPRIMIR.html` | Guia reunido em português, com sumário; pode ser impresso ou salvo como PDF pelo navegador. |
| `guia/01-Guia-completo.md` | Preparação, cartas, zonas, turnos, prioridade, pilha, combate e exceções. |
| `guia/02-Cola-da-mesa.md` | Consulta rápida durante a partida. |
| `guia/03-Perguntas-e-pegadinhas.md` | Dúvidas práticas, respostas e regras de referência. |
| `guia/04-Glossario-e-mecanicas.md` | Termos em português/inglês e mapa das mecânicas. |
| `guia/05-Commander-banidas-e-brackets.md` | Regras do formato, lista consultada de banidas e conversa antes da partida. |
| `guia/06-Roteiro-de-simulacao.md` | Exercícios e especificação para uma futura simulação de decks. |
| `fontes-oficiais/MagicCompRules-2026-09-25.txt` | **Texto integral do manual oficial em inglês**, incluindo todas as regras numeradas, variantes e glossário. |
| `fontes-oficiais/LEIA-ME.md` | Origem, versão, PDF oficial e demais documentos. |
| `dados/` | Regras, glossário, cenários, fontes, assuntos e estado de exemplo em JSON. |
| `simulador/index.html` | Laboratório interativo de prioridade, turnos, pilha e perguntas de treinamento. |
| `desenvolvimento/` | Gerador do pacote e verificação do motor didático. |

## Como estudar para o fim de semana

1. Leia a cola da mesa e as seções de prioridade/pilha do guia.
2. No laboratório, lance uma feitiçaria, passe a prioridade e responda com uma instantânea ou uma anulação.
3. Repare que todos precisam passar consecutivamente para resolver **um** objeto. Depois há outra janela de resposta.
4. Faça os exercícios. Procure a regra indicada na aba de pesquisa se precisar aprofundar.
5. Antes de jogar, combine nível dos decks, proxies, combos, atalhos e como lidar com erros.

## Alcance do material

O manual oficial integral é a cobertura de todas as regras gerais e palavras-chave. O guia em português é uma explicação autoral com situações de mesa, não uma tradução integral oficial. Para uma carta específica, confira seu texto **Oracle** e seus rulings no Gatherer; versões impressas antigas podem ter errata. As regras e os rulings particulares de todas as cartas existentes não foram copiados para um banco local.

O laboratório é uma **simulação didática das janelas de ação**, com mágicas fictícias e custos assumidos como pagos. Ele verifica prioridade, timing, terreno por turno, lealdade e resolução da pilha nos casos demonstrados. Não é um motor completo capaz de jogar quaisquer decks de Magic. Combate, pagamento detalhado de mana, cartas individuais e exceções de texto ficam nos exercícios e no guia. Para simular os decks da sua mesa, a etapa seguinte precisa dos comandantes e das listas.

Foram aprovadas **36 verificações de motor/conteúdo** e **12 de interação no DOM**. O método e a limitação da inspeção visual estão em `desenvolvimento/VERIFICACAO.md`.

As fontes oficiais são da Wizards of the Coast. Os exemplos explicativos e o código deste pacote foram criados para este estudo. A cópia do TXT foi extraída do documento oficial disponibilizado online, preservando seu conteúdo e normalizando as quebras de linha; não é uma cópia binária autenticada do download. O manifesto registra a cobertura das linhas e o SHA-256 **do arquivo local**.

Regras de cartas e atualizações posteriores prevalecem sobre este retrato de 03/10/2026. Use `dados/fontes.json` e os links oficiais para atualizar a base.
