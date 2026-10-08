# Proposta: Commander online da nossa mesa

Checkpoint 1, 03/10/2026. O detalhamento das 547 cartas está em [levantamento/LEVANTAMENTO.md](levantamento/LEVANTAMENTO.md) e [levantamento/cartas.json](levantamento/cartas.json), gerados por `ferramentas/levantamento.mjs`.

## Recomendação em uma frase

Construir o nosso motor em TypeScript. XMage e Forge já implementam quase todas as cartas, mas nenhum dos dois roda no navegador, retoma uma partida depois de um reinício do servidor ou reproduz uma partida a partir de uma semente. Adaptar qualquer um deles para isso dá mais trabalho e mais risco do que escrever um motor para 507 cartas. A seção 4 traz a comparação.

## 1. O que o levantamento mostrou

| | Cartas |
| --- | ---: |
| Entradas em `cards.json` | 547 |
| Cartas dos decks (únicas) | 507: 5 básicos, 100 terrenos não básicos, 402 outras |
| Fichas e objetos auxiliares (Treasure, Monarch, Copy, Manifest, Poison Counter…) | 40 |
| Rulings a conferir | 1.285, em 366 cartas |

Em três camadas de implementação:

- **Só dados: 7 cartas dos decks e as 40 auxiliares.** São os básicos, criaturas sem texto (Indomitable Ancients, Zetalpa) e fichas.
- **Genéricas: 463.** Cabem na linguagem de efeitos, desde que o motor tenha os mecanismos certos. Entre elas há 55 terrenos que são só mana e "entra virado"; quase todos os outros 45 terrenos acrescentam uma habilidade comum, como vidência, busca de básico ou devolver um terreno.
- **Especiais: 37.** Precisam de código próprio. A lista com o motivo de cada uma está no levantamento. Exemplos: Abstract Performance (uma pilha virada para baixo no exílio e um oponente escolhe), Kefka (conjura mágicas de outros donos), Gogo, Muddle, Cursed Mirror e Spirit of Resilience (viram cópia até o fim do turno), Tree of Perdition/Redemption (trocam vida por resistência), Veyran (gatilho dispara uma vez a mais), Joshua (vira uma Saga criatura), Everlasting Torment, Weathered Sentinels.

Mecanismos raros que o motor precisa ter, cada um usado por poucas cartas:

- cópia de permanente, camada 1 (18 cartas);
- cópia de mágica (11);
- **preparação** (CR 722, 9 cartas de Secrets of Strixhaven);
- transformar, Saga e Classe;
- virada para baixo e manifestar;
- fase (phasing), monarca e bênção da cidade;
- goad e exigências de ataque em multijogador;
- custo para atacar (Ghostly Prison);
- dano de combate pela resistência e atacar com defensor (o comandante Felothar e mais 5 cartas);
- combate adicional;
- ward com custo que não é mana (o comandante Auntie Ool);
- wither e -1/-1 em massa;
- mudança de controle e as camadas 4, 6 e 7b;
- conjurar de outras zonas e sem pagar o custo;
- mana com restrição e gatilhos de mana gasta;
- mana híbrida, mono-híbrida e phyrexiana;
- histórico de eventos do turno (26 cartas olham "vida ganha neste turno", "carta saiu do cemitério", "segunda mágica" e parecidos).

O que pesa em cada deck: Prismari tem 10 cartas especiais e 334 rulings, por causa de cópias de mágicas e de permanentes. Witherbloom não tem nenhuma especial. Quintorius, History Chaser é um planeswalker comandante (CR 903.3a).

## 2. Arquitetura e stack

Uso **TypeScript do começo ao fim, em Node 24**, que já está instalado. Assim o motor, o servidor, os bots e o cliente usam a mesma linguagem, e o motor roda igual no servidor, nos bots e nos testes. Python seria lento para os bots simularem jogadas, e Rust deixaria a iteração mais lenta sem necessidade.

```
jogo/
  motor/       regras puras, sem rede nem disco; estado em JSON; determinístico
  cartas/      uma definição por carta + teste; fichas
  bots/        aleatório (fase 1), heurístico com busca (fase 4); rodam em worker threads
  servidor/    HTTP + WebSocket (ws), salas, autenticação, SQLite embutido (node:sqlite)
  cliente/     Vite + Preact + TypeScript; mesa, prompts, log
  ferramentas/ importação dos decks, levantamento, COBERTURA.md, miniaturas das imagens
```

**O motor é uma máquina de decisões.** `avancar(estado)` executa tudo o que é automático, como ações baseadas em estado, gatilhos, etapas sem prioridade e passes automáticos. Ele para quando algum jogador precisa decidir e devolve a decisão pendente com as opções legais já enumeradas. `responder(estado, jogador, resposta)` só aceita uma dessas opções. Disso decorrem várias propriedades:

- **Só há ações legais**, porque o servidor nunca aplica algo fora da lista.
- **Os prompts dispensam digitação**, porque cada decisão tem opções fechadas: alvos, modos, X, ordem de gatilhos, bloqueios e pagamento de mana.
- **O bot aleatório** sorteia uma opção legal.
- **A partida é reproduzível.** Uma partida é a semente, os decks e a lista de respostas. O gerador pseudoaleatório fica dentro do estado.
- **A persistência é simples.** O SQLite guarda o log de respostas e um snapshot por turno. Depois de um reinício, o servidor carrega o snapshot e reaplica as respostas seguintes. Um bug relatado vira um teste a partir do arquivo exportado (versão, semente, respostas).

**Informação oculta.** O servidor nunca envia o estado inteiro, só `vista(estado, jogador)`. Mão, grimório e cartas viradas para baixo dos outros aparecem como contagem ou verso. Cada mudança de zona cria um objeto novo com ID novo (CR 400.7), então ninguém segue uma carta embaralhada. Há testes que verificam que a vista de um jogador não contém nada escondido dele. Os bots recebem a mesma vista.

**Passagem automática (CR 732).** Cada jogador configura as paradas por etapa, separando o próprio turno do turno dos outros, e tem atalhos como "passar até o fim do turno" e "passar enquanto não houver nada novo na pilha". O sistema passa sozinho quando a única ação possível é passar, sempre com o mesmo atraso, para não revelar que a mão não tem resposta. Ele sempre para quando é preciso decidir algo, quando você é atacado e quando um oponente põe algo na pilha (este último é configurável). O servidor resolve as sequências de passes de uma vez.

**Regras de Commander e multijogador**, cada uma com o número citado no código e no teste:

- zona de comando, imposto e retorno à zona de comando (903.8, 903.9a como ação baseada em estado, 903.9b como substituição);
- 21 de dano de combate do mesmo comandante (903.10a);
- vida inicial 40 (903.7) e identidade de cor (903.4);
- mulligan com o primeiro gratuito em multijogador (103.5c), regra que não vale no um contra um;
- compra no primeiro turno em multijogador (800.7);
- atacar vários jogadores (802) e saída de um jogador (800.4).

"Oponentes" e "aliados" são funções, então o 2x2 fica possível depois.

**Acesso.** Cada sala tem código e senha. A senha é guardada com scrypt e as tentativas são limitadas. A sessão usa cookie HttpOnly. Cada assento tem um token de reconexão, e quem cai volta ao mesmo lugar. As imagens só são servidas a quem estiver numa sala. Elas vêm de `../cartas/assets`. Para a mesa, gero miniaturas WebP numa pasta ignorada pelo git, para não mandar 1 MB de PNG por carta. O PNG original aparece na ampliação.

**Interface.** A mesa ocupa a tela, com você embaixo e os oponentes em volta. A carta é o elemento visual principal, e as cores são sóbrias e escuras, sem os padrões vetados no pedido. Os textos ficam em PT-BR, e o texto da impressão em português aparece quando existir. A conferência é feita com capturas de tela no Playwright.

## 3. Como as cartas serão implementadas

**A linguagem de efeitos é TypeScript tipado, não um parser de texto.** Cada carta é um arquivo montado com primitivas do motor: habilidades estáticas, ativadas, engatilhadas e de mana; custos; alvos com filtros; efeitos; condições; durações; escolhas. O compilador recusa uma carta malformada. Os mecanismos raros da seção 1 são implementados uma vez no motor e viram primitivas. As 37 especiais usam `custom(...)`, com acesso à mesma API e com testes como qualquer outra.

```ts
export default card('Infernal Grasp', {            // {1}{B} Instant
  spell: [destroy(target(creature())), loseLife(you, 2)],
});
export default card("Archon of Sun's Grace", {
  keywords: ['flying', 'lifelink'],
  statics: [grant('lifelink', creatures({ subtype: 'Pegasus', controller: you }))],
  triggers: [whenever(enters(enchantment({ controller: you })), createToken('Pegasus 2/2 flying'))],
});
```

O código usa identificadores em inglês, o mesmo vocabulário do Oracle e do CR, para facilitar a conferência. Testes, log e interface ficam em português.

- **Rascunho automático.** Um script lê o Oracle e gera o que é formulaico: palavras-chave, habilidades de mana, "entra virado a menos que", ciclagem, terrenos com vidência e busca de básico. Isso cobre quase todos os terrenos e parte das criaturas. O resto é escrito à mão; na fase de cartas, em paralelo por subagentes, um por grupo de mecânica, todos sobre a mesma API e a mesma suíte.
- **Testes e rulings.** Cada carta tem pelo menos um teste do comportamento do Oracle. Cada um dos 1.285 rulings recebe o status "coberto pelo teste X" ou "não se aplica", com o motivo. `COBERTURA.md` é gerado por script e lista as cartas implementadas, testadas, com rulings conferidos e pendentes.
- **Modo manual para pendentes.** Uma carta ainda não implementada pode ser jogada. Ao resolver, quem a controla aplica o efeito à mão (move cartas, põe marcadores, cria fichas, muda vida), e o log registra o que foi feito. Os bots não jogam cartas pendentes.

## 4. Construir ou adaptar XMage/Forge

Conferi nos repositórios, em 03/10/2026, as 502 cartas não básicas: o XMage tem as 502 e o Forge tem 501 (não encontrei Baldin, Century Herdmaster).

| | Construir (TypeScript) | XMage | Forge |
| --- | --- | --- | --- |
| Cartas | começa do zero; esta é a maior parte do trabalho | 502/502 | 501/502 |
| Navegador | sim | não; cliente Java para desktop | não; desktop/Android. O Manabrew roda o Forge no navegador, mas está em pré-lançamento |
| Interface em PT-BR | sim | não | sim |
| Servidor dedicado | sim | sim, com mesas protegidas por senha | não há modo servidor: o host é um jogador e, se ele cair, a partida acaba |
| Sobrevive a reinício | sim (log + snapshot) | não; salvar partida é opção marcada "not working correctly yet" | não |
| Semente reproduzível | sim | não de fábrica | não de fábrica |
| Teste por carta citando o CR | sim, desde o início | tem muitos testes, mas não por carta | poucos testes |
| Bots | heurísticos nossos; começam mais fracos | IA fraca em multijogador | a melhor IA aberta |
| Licença | nossa | MIT | GPL-3 |
| Esforço até a primeira partida | grande: várias sessões | quase nenhum: instalar servidor e clientes | pequeno em rede local; grande para chegar ao navegador |

**Por que recomendo construir.** O que diferencia o pedido não existe em nenhum dos dois: navegador, retomada após reinício, semente, garantia de que nada oculto chega ao cliente e testes que citam o CR. No XMage, o cliente é Swing e fala um protocolo Java serializado. Seria preciso escrever um cliente web inteiro e mexer em salvamento de estado num motor de centenas de milhares de linhas. No Forge, falta até o servidor. Construir é o caminho mais longo, mas cada requisito fica sob nosso controle e verificável.

**O que se perde ao construir:**

- **Tempo.** A cobertura de cartas que eles já têm pronta é trabalho nosso.
- **Força dos bots.** A IA do Forge vai continuar mais forte que a nossa por um bom tempo.

O maior risco técnico é a interação entre cartas: camadas, cópias e substituições. As mitigações:

- testes por carta e por ruling;
- as 200 partidas de bots;
- consultar o script do Forge e o código do XMage nos casos difíceis, só como referência, sem copiar código.

**Alternativa que não exclui a recomendação.** Se vocês quiserem jogar já nesta semana, um servidor XMage privado funciona hoje, em inglês, com cliente para instalar e bots fracos. Pode servir enquanto o nosso fica pronto.

## 5. Fases, ajustadas ao levantamento

Proponho uma mudança de ordem. As cartas se dividem em duas partes, e o servidor e o cliente entram no meio. Assim vocês jogam entre humanos, com o modo manual cobrindo as pendentes, antes de as 547 estarem prontas.

1. **Núcleo do motor.**
   - Estado, turno, prioridade, pilha, mana, ações baseadas em estado, combate com vários defensores, camadas, substituição e prevenção, gatilhos (APNAP), Commander e todos contra todos.
   - Importação dos decks com validação 903.5: 100 cartas, singleton e identidade de cor.
   - Primitivas da linguagem de efeitos e as 47 cartas só de dados.
   - Testes derivados do CR e de `dados/cenarios.json`.
   - Bot aleatório jogando milhares de partidas como teste de estresse.
2. **Cartas, parte A.** As genéricas mais simples: terrenos, mana, palavras-chave, mágicas diretas, gatilhos de entrada, morte, ataque e etapa. São 229 cartas, 85 delas terrenos (o campo `parte` em `cartas.json`). O script do `COBERTURA.md` começa aqui.
3. **Servidor e cliente.** Salas privadas, escolha de deck, quatro jogadores e um contra um, reconexão, persistência, log legível, passagem automática e modo manual. A interface é conferida com capturas de tela.
4. **Cartas, parte B.** As outras 271: Auras e equipamentos, marcadores e -1/-1, cemitério e conjurar de outras zonas, cópias, preparação, faces duplas, Saga e Classe, e por fim as 37 especiais. Aqui entram os subagentes em paralelo por grupo. A fase fecha com 547/547.
5. **Bots.**
   - Heurísticas: desenvolver mana, usar o comandante, escolher o alvo pela ameaça de cada oponente, decidir ataque e bloqueio por simulação de combate.
   - Busca rasa: para cada jogada candidata, simulam no próprio motor com informação determinizada. As cartas ocultas são sorteadas do que eles não viram da lista do deck, que é conhecida na mesa.
   - Orçamento de cerca de 1 s por decisão. Rodam as 200 partidas com 4 bots e limite de turnos.
6. **Hospedagem.** Deploy e instruções para os amigos. Antes de criar conta, publicar ou gerar custo, peço sua confirmação.

## 6. Onde hospedar

O servidor usa pouca memória (centenas de MB). O que pesa são as imagens.

1. **Começar no seu PC, com um túnel HTTPS gratuito (Tailscale Funnel ou Cloudflare Tunnel).** Custa zero e as imagens saem direto de `cartas/assets`. O limite é que só se joga com o PC ligado. Exige criar uma conta gratuita num desses serviços, e eu pergunto antes.
2. **Para ficar no ar 24 horas: uma VPS pequena.** As opções são a Hetzner, por volta de €4–5 por mês (confiro o preço antes), ou a Oracle Cloud Always Free, que é gratuita mas exige cartão na verificação e às vezes não tem capacidade disponível. As imagens são copiadas para lá fora do git.

Ficam descartados os planos gratuitos que hibernam ou não têm disco persistente (Render, Railway), porque perderiam partidas em andamento.

## 7. O que preciso de você

1. **Aprovar construir o nosso motor** ou escolher partir do XMage ou do Forge.
2. **Aprovar a nova ordem das fases:** cartas em duas partes, com servidor e cliente no meio.
3. **Dizer se quer o servidor XMage provisório.** Ele fica fora do plano e não muda nada no resto.
