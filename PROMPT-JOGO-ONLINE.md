# Projeto: Commander online privado da nossa mesa

## Contexto

Eu e meus amigos jogamos Magic: The Gathering no formato Commander, presencialmente, uma vez por semana, e só dá tempo de uma partida. Quero um jogo online privado, só nosso, para jogarmos mais vezes durante a semana com os nossos próprios decks, e também jogar contra bots que usam esses mesmos decks quando faltar gente.

Os dados de que você precisa já estão nesta pasta (`C:\Users\icaio\Documents\Magic-Commander`), coletados e verificados em 03/10/2026:

- `cartas/`: os 7 decks (100 cartas cada, 547 cartas únicas), com texto Oracle, rulings, imagens e símbolos. Leia `cartas/README.md` primeiro, porque ele explica o formato de `decks/*/deck.json`, `data/cards.json`, `data/printings.json`, `data/rulings.json` e `assets/`. O `cartas/manifest.json` está com status `complete`.
- `fontes-oficiais/MagicCompRules-2026-09-25.txt`: as Comprehensive Rules (CR) integrais, vigentes desde 25/09/2026. É a fonte normativa. `dados/regras-completas.json` tem o mesmo conteúdo indexado.
- `guia/` e `dados/`: guia em português, glossário, cenários de regras (`dados/cenarios.json`) e `guia/06-Roteiro-de-simulacao.md`, que já esboça requisitos para um motor.
- `simulador/`: um laboratório didático de prioridade e pilha com cartas fictícias. Não é um motor completo. Aproveite ideias e cenários, mas não o trate como base.

| Deck | Comandante |
| --- | --- |
| Abzan Armor | Felothar the Steadfast |
| Blight Curse | Auntie Ool, Cursewretch |
| Lorehold Spirit | Quintorius, History Chaser |
| Prismari Artistry | Rootha, Mastering the Moment |
| Silverquill Influence | Killian, Decisive Mentor |
| Terra | Terra, Herald of Hope |
| Witherbloom Pestilence | Dina, Essence Brewer |

## O que quero no fim

Um jogo de Commander no navegador em que até quatro pessoas, cada uma em sua casa, entram numa sala privada, escolhem um dos 7 decks e jogam uma partida inteira com as regras oficiais aplicadas pelo sistema. Qualquer assento vazio pode ser ocupado por um bot que joga com um desses decks.

Modos, em ordem de prioridade:

1. **Todos contra todos, quatro jogadores.** É o Commander padrão e o modo principal (CR 800, 806 e 903).
2. **Um contra um**, no mesmo formato Commander.
3. **Dois contra dois: fica fora do escopo agora.** Não implemente, mas também não feche a porta. Por exemplo, calcule "oponentes" e "aliados" por uma função, em vez de presumir que todo outro jogador é oponente (CR 808 e 810, quando chegar a hora).

"Dentro das regras" significa que o servidor só aceita ações legais e aplica pilha, prioridade, ações baseadas em estado, combate com vários jogadores defensores, custos e mana, além das regras próprias do Commander: zona de comando, imposto de comandante, dano de comandante, identidade de cor, vida inicial, mulligan e saída de um jogador da partida. Confira cada regra no texto do CR, não de memória, e cite o número da regra no código ou no teste que a implementa.

## Restrições

- `cartas/`, `fontes-oficiais/` e `dados/` são somente leitura. Crie o jogo numa pasta nova, `jogo/`. Se precisar transformar dados, gere os arquivos derivados dentro de `jogo/`.
- O servidor é a autoridade sobre o estado. Informação oculta (mão, grimório, cartas viradas para baixo) nunca vai para o cliente de quem não pode vê-la.
- Embaralhamento e aleatoriedade usam uma semente registrada, para que uma partida possa ser reproduzida e um bug relatado possa ser repetido.
- O acesso é privado: sala com código e senha, sem cadastro público. As imagens das cartas são só para nosso uso, então o servidor não fica exposto sem autenticação.
- A interface é em português do Brasil. O texto das cartas pode aparecer em inglês (Oracle), com a impressão em português quando ela existir em `data/printings.json`.
- Uma partida de Commander leva de uma a duas horas. Quem cair da conexão precisa voltar ao mesmo assento, e a partida precisa sobreviver a um reinício do servidor.
- Com quatro jogadores, a prioridade passa por dezenas de janelas por turno. Implemente passagem automática de prioridade com paradas configuráveis (CR 732, Taking Shortcuts); sem isso a partida fica impraticável.
- A pasta ainda não é um repositório git. Inicie um em `jogo/` e faça commits a cada marco. As imagens (859 MB em `cartas/assets/`) ficam fora do repositório e são servidas da pasta original.
- A stack é escolha sua; justifique-a na proposta. A máquina é Windows 11, e Python e Node já foram usados nesta pasta. A hospedagem precisa ser gratuita ou bem barata.

## Como trabalhar

### Explore antes de escrever código

Leia `cartas/README.md`, abra um `deck.json` e as entradas correspondentes em `cards.json` e `rulings.json`, percorra o índice do CR (seções 1 a 7, 800 e 903) e o roteiro de simulação. Depois faça um levantamento das 547 cartas: agrupe-as por padrão de habilidade (entrada no campo, ativadas, gatilhos de ataque, substituição, cópias, fichas, custos alternativos, faces duplas e assim por diante) e marque as que dependem de mecanismos de regra raros. Esse levantamento define o que o motor precisa suportar.

### Checkpoint 1: proposta (pare aqui e espere minha resposta)

Escreva `jogo/PROPOSTA.md`, curto, com:

- a arquitetura (motor de regras, servidor, cliente, bots) e a stack, com o porquê;
- como as cartas serão implementadas (por exemplo, uma linguagem de efeitos mais código para os casos especiais), com os números do levantamento: quantas cartas cabem em padrões genéricos e quais são casos especiais;
- uma comparação honesta com adaptar um motor de código aberto que já joga Commander com IA, como XMage ou Forge, para eu decidir entre construir o nosso ou partir de um existente. Recomende um caminho;
- o plano de fases abaixo, ajustado ao que você descobriu, e onde hospedar.

Esta é uma parada que eu quero: não escreva o motor antes de eu aprovar a proposta.

### Fases depois da aprovação

1. **Núcleo do motor.** Estado de jogo, estrutura de turno, prioridade, pilha, mana, ações baseadas em estado, combate, regras de Commander e multiplayer todos contra todos. Testes automatizados derivados do CR e de `dados/cenarios.json`. Desde já, um bot que só escolhe jogadas legais ao acaso, para estressar o motor.
2. **Cartas.** Implemente as 547 cartas. Cada carta tem pelo menos um teste do comportamento do seu texto Oracle e é conferida contra seus rulings. Mantenha em `jogo/COBERTURA.md` uma lista, gerada por script, das cartas implementadas, testadas e pendentes. Enquanto houver pendências, uma carta pendente pode ser resolvida em modo manual (o jogador aplica o efeito à mão e o log registra), para que a partida não trave. O objetivo continua sendo zero pendências.
3. **Servidor e cliente.** Salas privadas, escolha de deck, partidas de quatro jogadores e um contra um, reconexão, persistência e um log da partida legível.
4. **Bots.** Jogam só com a informação que um jogador teria. Escolhem jogadas razoáveis: desenvolvem mana, usam o comandante, escolhem alvos e ataques com critério e respondem a ameaças. Jogam rápido o bastante para não segurar a mesa. Comece com heurísticas e busca locais, sem custo por partida. Bot baseado em LLM fica fora do escopo, a menos que eu peça.
5. **Hospedagem.** Prepare o deploy e as instruções para meus amigos entrarem. Peça minha confirmação antes de publicar qualquer coisa na internet, criar conta em algum serviço ou gerar custo.

### Interface

A mesa é a tela principal: os quatro jogadores ao redor, o campo de batalha de cada um, a zona de comando, a mão do jogador local, cemitério e exílio acessíveis, a pilha visível, um indicador claro de quem tem prioridade e de qual etapa está em andamento, a vida e o dano de comandante recebido de cada oponente, e o log. As imagens das cartas são o elemento visual principal, com ampliação ao passar o mouse. Escolhas (alvos, modos, valor de X, ordem de gatilhos, bloqueios) aparecem como prompts claros e nunca exigem digitação.

Não use: layout de dashboard com cartões de métricas, gradientes roxo e azul, glassmorphism, fundo creme ou off-white, emojis como ícones, rótulos em fonte monospace, botões em formato de pílula, nem cantos muito arredondados com sombra difusa em tudo.

Confira a interface renderizada com capturas de tela de um navegador automatizado, não só o DOM.

### Quando está pronto

- Uma partida de quatro jogadores e uma de um contra um, em navegadores diferentes, vão até o fim com qualquer combinação dos 7 decks.
- Três bots e um humano funcionam. Quatro bots jogando sozinhos completam 200 partidas seguidas sem erro, travamento, estado ilegal ou partida infinita (com um limite de turnos que registra empate).
- `jogo/COBERTURA.md` mostra 547 de 547 cartas implementadas e testadas.
- A suíte inteira passa, e você a rodou por completo, não só a parte que alterou.

Se algum item não for alcançado, diga qual e por quê, com a saída do teste. Não marque como feito o que não foi verificado.

### Progresso e continuidade

Mantenha `jogo/PROGRESSO.md` como lista de verificação das fases e dos itens, atualizada conforme você avança. É ela que permite retomar o trabalho numa sessão nova. No início de cada sessão, escreva uma linha dizendo o que vai fazer. Ao fechar uma fase, faça uma recapitulação curta: o que foi feito, o que foi verificado e o que precisa de mim.

Entre os checkpoints, trabalhe sem parar para relatar. Não encerre um turno com um resumo que anuncia o próximo passo sem executá-lo, nem com uma oferta de continuar "se eu preferir", nem com uma lista de decisões que, pela sua própria avaliação, não bloqueiam o resto do trabalho. Notas de status e recomendações são bem-vindas, mas na mesma mensagem da sua próxima ação, seguindo com o que não depende da minha resposta. As paradas que eu quero são: o checkpoint 1, um bloqueio real que só eu consigo resolver, e a confirmação antes de ações arriscadas, irreversíveis ou públicas (deploy, criação de contas, custos, apagar arquivos).

Você pode usar subagentes em paralelo na fase de cartas, por exemplo um por grupo de mecânica, desde que todos sigam a mesma linguagem de efeitos e passem na mesma suíte de testes.
