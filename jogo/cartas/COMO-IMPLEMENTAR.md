# Como implementar uma carta

Escrito para quem vai implementar cartas neste repositório (pessoas ou agentes). Leia inteiro antes de começar.

## Regras do jogo

- **Uma carta por arquivo:** `cartas/defs/<slug>.ts` com a definição e `cartas/defs/<slug>.test.ts` com os testes. O slug é o nome em minúsculas, sem acentos nem apóstrofos, com hífens: `Night's Whisper` → `nights-whisper`. Use `ferramentas/slug.ts` se tiver dúvida.
- **Não altere `motor/`.** Se faltar um recurso do motor, não improvise com gambiarra: deixe a carta sem arquivo (ela continua pendente) e anote o que falta no seu relatório.
- **Texto Oracle é a fonte.** Copie o Oracle em inglês como comentário no topo do arquivo. O texto que aparece para o jogador (campo `text` das habilidades, rótulos e prompts) é em português do Brasil e usa "carta", nunca "card".
- **CR citado:** quando a carta depende de uma regra específica, cite o número do CR no comentário do código ou no título do teste (`it('CR 608.2b: …')`). Confira no arquivo `../fontes-oficiais/MagicCompRules-2026-09-25.txt` (somente leitura), não de memória.
- **Rulings:** liste os rulings com `node ferramentas/rulings.ts "Nome da Carta"`. Na definição, preencha `rulings` com uma entrada para cada número: `'teste: <título do it>'` quando um teste cobre, `'regra geral: CR x.y (motor)'` quando é comportamento do motor já testado em `testes/`, ou `'não se aplica: <motivo>'` (por exemplo, cita uma carta que não está nos decks).
- **Rode os testes da carta:** `npx vitest run cartas/defs/<slug>.test.ts`. Antes de terminar, rode `npx tsc --noEmit -p tsconfig.json` e `npx vitest run cartas` inteiros.

## Esqueleto

```ts
// Infernal Grasp
// Destroy target creature. You lose 2 life.
import { defineCard, destroy, loseLife, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Infernal Grasp',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
        loseLife(c.g, c.you, 2, c.source);
      },
    },
  }],
  rulings: {},
});
```

- `faces[0]` é a face normal. Instantâneas e feitiços usam `spell`; permanentes usam `abilities`.
- Efeitos são **geradores** (`*effect(c) { … }`). Tudo que pode pedir uma escolha ao jogador (destruir com substituição, sacrificar, descartar, buscar, comprar, criar fichas, mover cartas) é gerador e se chama com `yield*`. Funções síncronas (vida, dano, marcadores, virar/desvirar, mana, efeitos contínuos) são chamadas direto.
- `c.you` é o controlador; `c.source` é a fonte (a mágica na pilha, ou o permanente da habilidade); `c.x`, `c.modes`, `c.event` (dados do evento que disparou) e `c.data` (dados livres; `c.data.costInfo` tem o que foi pago: `sacrificed`, `discarded`, `lifePaid`…).
- Leia o estado sempre por `c.g.state` depois de um `yield*`: não guarde referências antigas.

## API (tudo vem de `motor/api.ts`)

**Alvos** (`t.*`, CR 115): `t.creature(pred?, label?)`, `t.permanent`, `t.nonlandPermanent`, `t.artifact`, `t.enchantment`, `t.land`, `t.player(pred?)`, `t.opponent()`, `t.any()` (criatura, planeswalker ou jogador), `t.creatureOrPlaneswalker()`, `t.playerOrPlaneswalker()`, `t.spell(pred?)`, `t.card(zona, pred?, label, 'you'|'any'|'opponent')`. Quantidade: `upTo(n, spec)`, `exactly(n, spec)`, `anyNumber(spec)`; o `max` pode ser função de `(c) => c.x`. "Outro alvo": `{ ...t.creature(), differentFrom: [0] }`. Mágica ou permanente num alvo só ("mágica ou criatura alvo"): `{ what: 'spellOrPermanent', label, filter }`. Alvo da parte do presente: `{ ...spec, gift: true }` (só é escolhido com o presente prometido). Na resolução: `tgt(c, i, j)` (objeto ou null se ilegal), `tgtPlayer(c, i)`, `tgtRef`, `tgtsAll(c, i)`.

**Predicados** (`is.*`, combináveis com `and`, `or`, `not`): `creature`, `land`, `nonland`, `artifact`, `enchantment`, `planeswalker`, `instantOrSorcery`, `permanentCard`, `type(t)`, `subtype(t)`, `token`, `nontoken`, `legendary`, `basic`, `yours`, `ownedByYou`, `opponents`, `other`, `tapped`, `untapped`, `color(c)`, `monocolored`, `kw(k)`, `mvAtMost(n)`, `mvAtLeast(n)`, `powerAtMost(n)`, `toughnessAtMost(n)`, `withCounter(kind?)`, `enchanted`. Um predicado recebe `(ctx, id)`; monte o contexto com `{ g: c.g, you: c.you, source: c.source }`.

**Habilidades**
- Palavras-chave: `keywords('flying', 'vigilance')`, `keyword('defender')`, `protectionFrom('B')`. Nomes em inglês minúsculo, como no CR.
- Mana: `mana('G')`, `mana(['R','W'])` (uma ou outra), `mana('CC')`, `mana('any')`, `mana(fn, { cost, condition, extra, restriction })`; `manaCommanderIdentity()`. Terrenos: `land.tapped()`, `land.tappedUnlessBasics()`, `land.tappedUnlessControl('Mountain','Plains')`, `land.snarl(...)`, `land.pain([...])`, `land.filter('W','B')`, `land.scryOnEnter()`, `land.scryAbility('{4}')`, `land.surveilAbility('{2}{R}{W}')`, `land.bounceLand()`, `land.fetchBasic()`.
- Ativadas: `activated('{2}, {T}, Sacrifice another creature', function* (c) { … }, { targets, modes, timing: 'sorcery', oncePerTurn, zones: ['hand'], condition, text })`. O custo em texto aceita o formato do Oracle (`cost()` em `motor/dsl.ts` mostra as frases reconhecidas).
- Disparadas: `triggered(on.X(...), function* (c) { … }, { targets, condition (se interveniente, CR 603.4), oncePerTurn, zones, text })`. Atalho: `etb(effect, opts)` = "quando entra".
  - Gatilhos prontos: `on.selfEnters()`, `on.enters(pred)`, `on.entersBatch(pred)` ("um ou mais"), `on.selfDies()`, `on.selfLeaves()`, `on.dies((ctx, lkiChars, lkiObj, ev) => bool)`, `on.selfAttacks()`, `on.youAttack()`, `on.attacks(pred)`, `on.selfBlocks()`, `on.selfDealsCombatDamageToPlayer()`, `on.youCast(pred)`, `on.upkeep('you'|'each'|'opponent')`, `on.endStep(...)`, `on.beginCombat(...)`, `on.firstMain()`, `on.youGainLife()`, `on.landfall()`, `on.custom((ev, ctx) => bool | dados)`, `on.batch((evs, ctx) => bool | dados)`.
  - Eventos (`motor/events.ts`): `zone` (mudança de zona: `from`, `to`, `obj` novo, `old` antigo, `cause`), `damage`, `lifeGain`, `lifeLoss`, `counters`, `tap`/`untap`, `cast`, `activate`, `attackers`, `blockers`, `draw`, `discard`, `sacrifice`, `token`, `step`, `target`… O que o `match` devolver como objeto vira `c.event` na resolução.
  - Para um objeto que saiu do campo, use a última informação conhecida: `lkiChars(c.g, id)`, `lkiObj(c.g, id)`.
- Estáticas: `staticAbility({ affects: (ctx, obj) => bool, mods: (ctx, obj) => Mod[], condition, zones, rules: { … } })`; atalhos `selfGets(mods)`, `attachedGets(mods)`, `anthem(pred, mods)`. `Mod`: `{ k: 'pt', p, t }`, `{ k: 'setPT', p, t }`, `{ k: 'addKeyword', kw }`, `{ k: 'addAbility', id }`, `{ k: 'addTypes', types?, subtypes? }`, `{ k: 'setColors', colors }`, `{ k: 'loseAllAbilities' }`, `{ k: 'control', player }`.
  - Ganchos de regra (`rules`): `costModifier`, `canAttack`, `canAttackPlayer`, `attackCost`, `canBlock`, `canBeBlockedBy`, `assignsByToughness`, `canAttackWithDefender`, `noMaxHandSize`, `cantGainLife`, `lifeGainBonus`, `damageCantBePrevented`, `damageAsWither`, `untapDuringUntapOf`, `playerHexproof`, `cantBeCountered`, `cantCastSpells`, `loseHexproof`, `extraTriggers`, `mayPlayFrom`, `enterModifier`, `leavesBattlefield` (substitui o destino de um permanente que sai do campo, com o resto do evento em `then`: Kalitas). Veja `RuleHooks` em `motor/defs.ts`.
- Face (`faces[i]`): `altCosts` (com `condition`, também da mão: Flawless Maneuver), `additionalCosts`, `selfCost`, `delve`, `convoke: true`, `gift: giftCard()` (o oponente é escolhido ao conjurar; na resolução, `c.paid.gift`). Resguardo: `ward('{2}')`, `ward('blight:2')`, `ward('Pay 2 life')`, `ward('{3}, Pay 3 life')`. Iminente: `impending(n, custo)` (motor/mecanicas.ts); incubar: `incubate(g, p, n)`; fortalecer Jace: `empowerJace(c, n)` (cartas/fichas.ts). Custo "vire N criaturas": `{ k: 'tapCreatures', n, filter, includeSelf, label }`.
- Substituições ao entrar: `entersTapped(unless?)`, `entersWithCounters(kind, n)`, `asEnters(function* (c, ev) { … })` (pode escolher e gravar em `ev.choices`, que depois ficam em `obj.choices`).

**Ações** (`motor/actions.ts` e `motor/efeitos.ts`): `destroy`, `sacrifice`, `exile(g, ids, { linkTo })`, `returnToHand`, `moveObjects(g, [{ id, to }], causa)`, `putOntoBattlefield(g, [{ id, controller, tapped }], causa)`, `createTokens(g, jogador, 'Pest', n, { tapped })` (ids em `cartas/fichas.ts`), `draw`, `discard(g, p, n, { random, upTo })`, `mill`, `searchTo(c, p, filtro, n, zona, { tapped, reveal })`, `searchLibrary`, `shuffleLibrary`, `lookAndArrange(g, p, n, 'scry'|'surveil')`, `gainLife`, `loseLife`, `dealDamage(g, [{ source, target, amount, combat: false }])`, `addCounters(g, { kind: 'obj', id }, '+1/+1', n, c.you)`, `removeCounters`, `blight(g, p, n)`, `tap`, `untap`, `addMana(g, p, ['R','R'])`, `gainControl`, `attach`, `goad`, `becomeMonarch`, `counter(g, idNaPilha)`, `untilEndOfTurn(c, ids, mods)`, `withDuration`, `ruleEffect`, `delayed(c, abilityId, { data })` + `defineAbility(id, nextUpkeepTrigger(...))`/`nextEndStepTrigger`, `reflexive(c, abilityId, data)`, `mayPay(c, p, '{2}', rótulo)`, `eachSacrifices(c, jogadores, filtro, n, rótulo)`, `maySearchBasicToBattlefield(c, p, virado)`, `loot`, `chooseCreatureType`, `opponentLandColors`, `isAttacking`.
**Escolhas** (`motor/ask.ts`): `yesNo`, `chooseItems(g, p, prompt, itens, min, max)`, `chooseOne`, `chooseNumber`, `chooseColor`, `objItem(g, id, rótulo)`, `playerItem(g, p)`. Escolhas de vários jogadores seguem a ordem APNAP (`c.g.apnap()`, CR 101.4).
**Consultas**: `chars(g, id)` (características calculadas), `power`, `toughness`, `manaValue`, `hasKw`, `isCreature`, `isType`, `controllerOf`, `nameOf`, `creaturesOf(g, p)`, `controlledBy(g, p, filtro)`, `allCreatures`, `permanentsMatching`, `c.g.opponents(p)`, `c.g.state.turnStats[p]` (vida ganha no turno, cartas compradas etc.).

Habilidades concedidas, gatilhos atrasados e reflexivos precisam de id estável: defina com `defineAbility('Nome da Carta:chave', {...})` no topo do arquivo e use o id.

## Recursos do lote 2 (motor/criaturas.ts, motor/mecanicas.ts)

Todos vêm de `motor/api.ts`. Uma linha de uso por recurso:

- **Cópia:** `entersAsCopy({...})` ("você pode fazer com que entre como cópia de…"), `becomeCopy(c, obj, modelo, { except, duration })`, `copyWithExcept(g, modelo, except)`.
- **Combate adicional:** `addCombatPhaseAfterCurrent(c.g, { thenMain })`, `untapAttackers(c.g)`, `isFirstCombat(g)`, `onSecondMain()`.
- **Tramar, reunir, o Anel:** `yield* connive(g, obj, n)`, `onYouConnive()`, `yield* amass(g, p, 'Orc', n)`, `yield* ringTempts(g, p)`, `isRingBearer(g, id)`.
- **Regenerar:** `regenerate(c, id)`, `preventRegeneration(c, ids)`. Infectar em jogador já vira veneno no motor.
- **Palavras-chave de criatura:** `persist()`, `melee()`, `dethrone()`, `mobilize(n)`, `bloodthirst(n)`, `monstrosity(custo, n)`, `evolve()`, `changeling()`, `myriad()`, `...readAhead(capítuloFinal)` (no lugar de `sagaEnters()`), `...reconfigure(custo)`, `typecycling('Swamp', custo)`.
- **Confronto e investigar:** `yield* clash(g, p, oponente)`, `onYouWinClash()`, `yield* investigate(g, p, n)`. Fichas `Food`, `Clue` e `Blood` em `cartas/fichas.ts`.
- **Esconderijo e imprimir:** `hideaway(n)`, `linkedExiled(g, fonte, 'hideaway')`, `yield* mayPlayFree(g, p, carta, pergunta)`.
- **Contemplar:** `yield* behold(c, (id) => qualidade, 'um Dragon', { optional: true })` devolve `{ id, from }` ou null.
- **Descobrir:** `yield* discover(g, p, n)` devolve o valor de mana da carta descoberta (ou null).
- **Dano no turno:** `opponentDamageThisTurn(g, p)`, `hasMostLife(g, p)`. Celebração: `c.g.state.turnStats[p].nonlandPermanentsEntered`.
- **Mágica que ganha algo até o fim do turno e leva para o permanente** ("ela ganha ímpeto"): `spellGainsUntilEndOfTurn(g, controlador, fonte, mágica, mods)`.
- **Mana com efeito ao ser gasta, sem pilha:** `mana('R', { rider: ID })` com `defineFn(ID, (g, unidade, propósito, jogador) => …)` (Carnelian Orb of Dragonkind). Com gatilho na pilha continua sendo `onSpend`.
- **Ganchos novos (`rules`):** `keepsUnspentMana` (não perde a mana não gasta), `lookAtTopOfLibrary`, `cantSearchLibraries`, `legendRuleExempt`.
- **Modos que não podem repetir no turno:** `modal(1, 1, [...], { available: (c, i) => …, onChosen: (c, modos) => … })` (Parapet Thrasher).
- **Estática depois de troca de controle:** `c.you` de uma estática do campo é quem controla a fonte depois da camada 2.
- **O mesmo modo mais de uma vez:** `modal(3, 3, [...], { repeat: true })` (Mystic Confluence). Nos testes, um `tg.choose('escolha o modo', [rótulo])` por escolha, na ordem.
- **Custo adicional concedido por outro permanente:** gancho `grantedAdditionalCosts: (c, jogador, mágica) => [additionalCost(...)]` (Anhelo). **Cópia a mais de toda mágica copiada:** gancho `extraSpellCopies` (Twinning Staff).
- **Conjurar e exilar em vez de ir para o cemitério:** permissão com `exileInstead: true` (Kess, Power Pack). **Bis:** `encore('{3}{R}')`. **Dar suspender a uma carta exilada:** `grantSuspend(g, fonte, controlador, cartas)`.
- **Explorar e cara ou coroa:** `yield* explore(g, criatura)`; `flipCoin(g, jogador)` devolve true se ganhou.
- **Copiar habilidade na pilha:** `yield* copyStackAbility(g, idNaPilha, jogador, { newTargets: true })`; alvo "habilidade desencadeada" com `{ what: 'ability', label, filter }` (Mister Fantastic).
- **Ataque obrigatório ou proibido:** gancho `attacksOneOfIfAble: (c, criatura) => jogadores` (Galactus); efeito `{ k: 'rule', id: 'rule:attacksIfAble', params: { player } }` (Silver Surfer); efeito `rule:cantAttackPlayer` com `{ atacante, protegido, depois }` (Willie Lumpkin).
- **Gatilho reflexivo ("quando fizer isso"):** `defineAbility(ID, triggered({ kind: 'batch', match: () => false }, efeito, { targets }))` e `reflexive(c, ID)` (Invisible Woman, The Thing).
- **Aura que encanta jogador:** `enchant: t.opponent('oponente')`; o jogador encantado fica em `objeto.data.enchantedPlayer` (Archnemesis).
- **Ficha que entra virada e atacando:** `putOntoBattlefield(g, [{ controller, token: { copyOf }, tapped: true, attacking: alvo }], 'token')`, com `alvo = yield* escolheAtacado(c, rótulo)` de `cartas/viloes.ts` (Living Laser, Loki).
- **Um alvo por oponente:** `umaPorOponente(rótulo, filtroExtra)` de `cartas/viloes.ts` (Tri-Sentinel usa a mesma forma; Age of Ultron, Kang Dynasty).
- **Contagens do turno novas:** `turnStats[p].cardsDiscarded`, `turnStats[p].castLog` (tipos e subtipos de cada mágica conjurada), `turnStats[p].spellColorsCast`.
- **Efeitos de regra novos:** `rule:cantBeSacrificed` (Stilt-Man), `rule:flashNext` com `{ player, tipo }` (Progenitor's Icon).
- **Nos testes, no turno do oponente:** `tg.pass()` faz o jogador ativo passar e a prioridade vem para você; depois de cada resolução ela volta ao ativo.
- **Nos testes, `enterCard(tg, nome, jogador)` cria a carta no campo:** não a tira da mão; não coloque a mesma carta em `hand`.
- **Proteção contra subtipo e de jogador:** `{ k: 'addKeyword', kw: 'protection', param: 'subtype:Dog' }`; jogador: `ruleEffect(c, 'rule:playerProtection', duração, { players: [p], params: { quality: 'color:G' } })`.
- **Prevenir dano de combate a um subtipo:** `ruleEffect(c, 'rule:preventCombatDamageToSubtype', { kind: 'endOfTurn' }, { params: { controller, subtype } })` (Pack Leader).
- **Substituir "comprar duas ou mais":** gancho `multiDrawInstead: (c, jogador, n) => boolean` (Alms Collector). **Bloqueio obrigatório por exatamente uma:** gancho `mustBeBlockedByExactlyOne` (Nacatl War-Pride).
- **Estática que vale fora do campo:** `offField: true` na estática; fora do campo, `affects` usa `printedChars`, não `chars` (Maskwood Nexus).
- **Um gatilho por jogador que tomou dano de combate / devolver criatura sua:** `seusCausamDanoDeCombate(filtro)` e `devolveCriatura(c, rótulo, filtro, opcional)` em `cartas/gatos.ts`.
- **Nos testes com três jogadores**, a prioridade passa por todos em ordem: `while (tg.pending?.player !== 0) tg.pass()`.
- **Restrições e substituições novas:** gancho `minBlockers: (c, atacante) => N` (Troll of Khazad-dûm); gancho `drawInstead: (c, jogador) => boolean` (Notion Thief); resguardo com descarte: `ward('discard')` (Timothar).
- **O que foi descartado no custo:** `(c.data.costInfo as { discarded?: ObjId[] }).discarded` (Moria Scavenger). **Redução de custo que depende do alvo:** `selfCost: (c, info) => …` olhando `info.targets[0]` (Bitter Downfall; na estimativa de "dá para conjurar?" o motor passa os alvos possíveis).
- **"Quando você cicla esta carta":** guarde `const ciclagem = cycling(custo)` e dispare em `e.type === 'activate' && e.abilityId === ciclagem.id` com `zones: ['graveyard', 'exile']` (Decree of Pain, Rampaging War Mammoth).
- **Notas de rulings repetidas:** `REUNIR` e `ANEL` em `cartas/mordor.ts`.
- **Nos testes, `tg.attack([...])` só deixa o ataque combinado:** ele é declarado quando a partida avança (`.passTo('declareBlockers')` ou `.passTo('main2', 0)`).
- **Vencer a partida e contar mágicas por nome:** `winGame(g, jogador, motivo)`; `state.castNames['jogador:Nome']` (Approach of the Second Sun). De onde a mágica foi conjurada: `objeto.stack.castFrom`.
- **Encerrar o turno:** `yield* endTheTurn(g)` (Time Stop). **Pular etapa ou fase neste turno:** `state.turn.skip = ['draw' | 'main' | 'combat']` (Fatespinner).
- **Ordem dos turnos e assentos:** `g.order()` é a ordem em vigor (invertida com `state.turnReversed`, Aeon Engine); `g.nextPlayer` e `g.apnap()` já a seguem. `state.turnOrder` são os assentos e não muda. Jogador à esquerda ou à direita: `seatNeighbor(g, p, 'left' | 'right')` (Inniaz, Aminatou).
- **Substituir a compra por outra coisa:** gancho `drawReplace: function* (c, jogador) { … }` (Shared Fate). **Jogar cartas exiladas com a permanente:** `mayPlayFrom` devolvendo `{ key, label, land: true }` para as cartas de `linkedExiled(g, fonte, chave)`.
- **Gatilho quando uma habilidade desencadeada vai para a pilha:** `on.custom((e) => e.type === 'triggerOnStack' …)`, com a habilidade em `e.obj` (Aboleth Spawn).
- **Mudar os alvos de algo na pilha:** `yield* changeTargets(g, idNaPilha, quemEscolhe, { noTriggerFor })` (Psychic Battle). **Um gatilho por mágica ou habilidade com alvos:** `on.batch` agrupando os eventos `target` por `by`.
- **Trocar ou definir o texto de regras (camada 3):** modificação `{ k: 'setText', abilities }`; o texto de uma criatura é `copyValuesChars(copiableValues(g, id), dono).abilities` (Exchange of Words).
- **Ação baseada em estado da carta, com escolha:** gancho `stateAction: function* (c) { … return fezAlgo; }` (Space Beleren). Precisa devolver false quando não há mais nada a fazer. **Setores:** `setorDe(g, id)` em `motor/setores.ts`.
- **Virar terreno, veículo ou outro tipo perdendo os demais:** `{ k: 'setTypes', types, subtypes, keepSupertypes: true }`; dentro de `mods`, as características parciais do objeto estão em `c.g.computing?.get(o.id)` (Imprisoned in the Moon guarda os tipos de terreno). Quem deixa de ser criatura sai do combate sozinho.
- **Sair de fase "até":** `phaseOut(g, [id])` e marcar `objeto.data.phaseOutUntil` para ela não voltar na etapa de desvirar (Oubliette).
- **Manifestar uma carta que não está no topo do grimório:** `putOntoBattlefield(g, [{ id, controller, faceDown: true, data: { manifestada: true } }], 'manifest')` (Jeskai Infiltrator).
- **Contagem do turno nova:** `turnStats[p].landsEntered` (Smuggler's Share).
- **Nos testes, a montagem responde sozinha às escolhas que aparecem antes da primeira prioridade** (os setores do Space Beleren, por exemplo): para roteirizar, ponha a permanente com `enterCard` depois de registrar as escolhas.
- **Restrição de quando conjurar:** `castOnlyIf: (c) => …` na face (Master Warcraft). **Outro jogador decide os ataques e os bloqueios do turno:** `ruleEffect(c, 'rule:combatChooser', { kind: 'endOfTurn' }, { params: { player } })`.
- **"Se você a conjurou da sua mão" num gatilho de entrar:** `condition: (c) => conjuradaDaMao(c.g, c.source)`; **"se você conjurou esta mágica durante a sua fase principal":** `conjuradaNaSuaFasePrincipal(c)`; **radiância:** `radiancia(g, alvo)`; **os Votos:** `...voto(palavraChave, texto)`. Tudo em `cartas/inferno.ts`.
- **Alvo que só existe com o reforço pago:** `{ ...t.creature(), min: 0, max: (c) => (paidTimes(c.g, c.source, 'kicker') > 0 ? 1 : 0), validateSet }` (Orim's Thunder). `min` é sempre número; quem varia é o `max`.
- **Um gatilho por criatura atacante:** `on.custom((e) => (e.type === 'attackers' ? e.attackers.map((a) => ({ atacante: a.obj })) : false))` (Righteous Cause). `on.attacks(pred)` dispara uma vez por declaração.
- **Cada jogador paga quanta mana quiser:** `chooseNumber` com o máximo achado por `canAfford` (de `motor/costs.ts`) e depois `payMana(g, p, [{ k: 'generic', n }], { purpose: { kind: 'effect' }, canCancel: true, label })` (Mana-Charged Dragon).
- **Nos testes, a escolha da criatura sacrificada num custo** é `tg.choose('Sacrifique', [nome])`, com S maiúsculo.
- **Mensagem de commit pelo PowerShell:** aspas duplas dentro da mensagem quebram o `git commit -m`; grave a mensagem num arquivo e use `git commit -F`.
- **Popular, eternizar, terreno adicional:** `yield* populate(g, p)`; `eternalize('{2}{G}{G}')` em `abilities`; `extraLandThisTurn(g, p)` (Explore). Notas de rulings de popular e de ganho de vida: `POPULAR` e `GANHO_DE_VIDA` em `cartas/miku.ts`.
- **Ganho de vida:** `on.youGainLife()` traz a quantidade em `c.event.amount`; "ganha o dobro": gancho `lifeGainDouble` (Boon Reflection); "ganha essa quantidade mais N": `lifeGainBonus` (Cleric Class). Vida ganha no turno: `turnStats[p].lifeGained`.
- **"Faça isso apenas uma vez por turno" (opcional):** marque `objeto.usedThisTurn[chave] = turn.number` só quando o jogador aceitar, e use a mesma conferência em `condition` (Nykthos Paragon, Ancient Cornucopia). `oncePerTurn` do gatilho é para "só dispara uma vez por turno".
- **Mana a mais ao virar um terreno:** `...manaAMaisDeTerreno()` de `cartas/miku.ts`. **Terreno que não desvira na próxima etapa de desvirar:** `objeto.data.skipNextUntap = true` (Vorinclex).
- **Custo de desvirar criaturas:** `activated([{ k: 'mana', cost }, { k: 'tap' }, { k: 'untapCreatures', n }], …)` (Halo Fountain). O texto de custo só reconhece "Tap a/one/two/three untapped creature(s) you control"; para "an", monte as partes à mão (Springleaf Drum).
- **Níveis de Classe:** veja `nivel(custo, n)` em `cartas/defs/cleric-class.ts` (usa `objeto.classLevel` e o evento `levelUp`).
- **Ficha com força e resistência variáveis por contagem:** `selfGets(…, texto, { cda: true })` na ficha (Elemental verde e branco). **Ficha X/X:** `createTokens(g, p, { copyOf: { def: 'Minion X/X', face: 0, except: { power: x, toughness: x } } }, 1)`.
- **Antes de escrever força e resistência num teste, confira com `node ferramentas/ficha-carta.ts "Nome"`;** a tabela de `cartas/fichas.test.ts` também confere cada ficha com a impressa (`fichasOracle`).
- **Uma carta com erro ao carregar quebra todos os testes** (todas entram por `cartas/index.ts`): rode o teste da carta nova antes de seguir.
- **Comandante, monarca, luta, Vibranium:** `controlaComandante(g, p)`, `ehComandanteDe(g, id, p)`, `luta(g, a, b)`, `criaVibraniumVirado(c, n)` e `artefatosDe(g, p)` em `cartas/wakanda.ts`; `becomeMonarch(g, p)` e `state.monarch`. Nos testes, o comandante é `{ name, commander: true }`.
- **Prevenir parte do dano, ou todo ele com algo no lugar:** gancho `preventsSomeDamage: (c, alvo, fonte, quantidade, combate) => quantoPrevine` (Heart-Shaped Herb, Panther Habit). Se a prevenção faz algo com o dano prevenido a favor de quem o receberia (devolve o dano: Comeuppance, Deflecting Palm), use `preventsSomeDamageFirst`, que vem antes das outras prevenções (o jogador afetado escolhe a ordem, CR 616.1e).
- **Gatilho atrasado que olha os próprios dados ao disparar:** no `match`, `(c as { delayed?: { data } }).delayed?.data`; na resolução, `c.data`. Com `delayed(c, id, { data, once: false, expiresTurn: turno })` ele vale até o fim do turno (Okoye, Fight for the Throne).
- **Gatilho depois de os bloqueadores serem declarados:** `on.custom((e) => e.type === 'blockers' …)` olhando `state.combat.attackers` (`blocked`, `removed`, `target`) (Coveted Jewel).
- **Substituir as fichas que seriam criadas:** gancho `tokenCreation`, trocando `tokens` e mantendo `de` (Divine Visitation). **Entrar com marcadores:** `putOntoBattlefield(g, [{ id, controller, counters: { finality: 1 } }], causa)`; marcador de palavra-chave (`indestructible`, `flying`…) já dá a palavra-chave.
- **Modo que não pode repetir enquanto a permanente existir:** `modal(1, 1, [...], { available, onChosen })` guardando os escolhidos em `objeto.data` (Kimoyo Beads).
- **Afinidade com artefatos e outras reduções próprias:** `selfCost: affinity` (de `cartas/artefatos.ts`) ou `selfCost: (c) => ({ reduce: n })`.
- **Nos testes, conjurar uma carta do exílio por uma permissão:** ache a ação com `tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))` e responda com `tg.answer({ kind: 'priority', action })`.

Jeitos de conjurar e custos (`motor/conjurar-alternativo.ts`). Nos testes, o método vai no segundo argumento de `tg.cast(nome, 'overload')`; custo opcional: `tg.choose('custo adicional opcional', ['Pagar: …' | 'Não pagar'])`; custo repetível: `tg.number('quantas vezes', n)`.

- **Metamorfose:** `abilities: [morph('{3}{R}{R}{R}')]`; conjurar virada: `tg.cast(nome, 'morph')`. **Ninjutsu:** `ninjutsu('{U}{B}', { commander: true })` em `abilities`.
- **Sneak, mayhem, retraçar:** `const x = sneak('{W}{B}')` (ou `mayhem(custo)`, `retrace()`), com `altCosts: [x.altCost]` e `x.ability` em `abilities`.
- **Loucura:** `madness('{1}{R}')` ou `madness('{2}{B}', { life: 8 })` em `abilities`; "se o custo de loucura foi pago": `madnessPaid(c)`.
- **Ricochete:** `abilities: [rebound()]` na face que tem `spell`. **Cascata:** `abilities: [cascade()]`.
- **Sobrecarga, espetáculo:** `altCosts: [overload('{6}{U}')]` e, no efeito, `if (overloaded(c)) { cada… } else { tgt(c)… }`; `altCosts: [spectacle('{B}')]`.
- **Recompra, multikicker, escalada:** `additionalCosts: [buyback('{3}')]`, `[multikicker('{2}')]` com `kickedTimes(g, id)` (num "entra com": `ev.spell?.paid.multikicker`), `[escalate(partes, rótulo)]`.
- **Baixa, esquadrão:** `const b = casualty(2)` (ou `squad('{3}')`), com `additionalCosts: [b.cost]` e `b.trigger` em `abilities`.
- **Número de alvos que depende do que foi pago:** `{ ...t.any(), min: 1, max: (c) => 1 + kickedTimes(c.g, c.source), validateSet }` (Comet Storm).
- **Permissão de conjurar com outro custo** (vida em vez de mana): `ruleEffect` com uma estática que devolve `{ key, label, free: true, parts: [{ k: 'life', n }] }` em `mayPlayFrom` (Xander's Pact).
- **Cópia de uma carta para conjurar:** `createObject(g, { def, owner, controller, zone: 'exile', isCopy: true, copyOf: { def, face: 0 } })` e `mayCastFree` (Flawless Forgery).

Formatos de carta (`motor/formatos.ts`). O nome da definição e o slug usam o nome completo com as duas faces: `'Fell the Profane // Fell Mire'` → `fell-the-profane-fell-mire.ts`. Cada face é uma entrada de `faces`, na ordem do Oracle. Nos testes, `tg.find`/`tg.bf` e o primeiro argumento de `tg.cast`/`tg.play` usam o nome completo; `tg.activate` e `activateMana` usam o nome da face que está para cima.

- **Modal de duas faces:** `faces: [frente, verso]`. Conjurar a frente: `tg.cast(nome, 'hand')`; o verso: `tg.cast(nome, 'hand@1')`; verso que é terreno: `tg.play(nome)`. Verso de terreno "pague 3 de vida ou entra virado": `land.payLifeOrTapped(3)`.
- **Dividida:** `faces: [metade1, metade2]`, cada uma com o seu `spell`. Segunda metade: `'hand@1'`; fusão: `'fuse'` (o motor reconhece pelo Oracle); aftermath: `'aftermath'`, só do cemitério, e a carta é exilada depois.
- **Sala:** `faces: [porta1, porta2]` com as habilidades de cada porta. Conjura-se uma porta (`'hand'` ou `'hand@1'`); destrancar a outra é a ação `unlock:<id>:<porta>`, só como feitiço. As habilidades só valem com a porta destrancada.
- **Aventura:** `faces: [carta, aventura]`. Aventura: `'hand@1'`; depois, a carta do exílio: `'adventure'`.
- **Reversível:** uma face só em `faces` (as duas são iguais).
- **Substituição na criação de fichas** ("o dobro", "em vez disso crie…"): gancho `tokenCreation` (Anointed Procession, Jinnie Fay). Num teste, efeitos que perguntam algo rodam com `runEffect(tg, …)` de `testes/artefatos.ts`, não com `tg.run`.
- **Outros ganchos:** `preventsDamage` (previne todo o dano a algo), `spellsHaveConvoke`.
- Substituição de marcadores (CR 614.1a): ganchos `countersBonus` (devolve N a mais: High Score) e `countersDouble`
  (dobra: Corpsejack Menace). Valem em `addCounters` e em quem entra com marcadores; o motor soma antes de dobrar.
  Dobrar marcadores (CR 701.10e) é pôr outros tantos: `dobraMarcadores` em `cartas/tartarugas.ts`.
- Dano em dobro (CR 701.10g): gancho `damageDouble(c, fonte, alvo, combate)`, aplicado antes da prevenção (Raphael).
- Mana de fontes que são artefatos gasta numa mágica: `manaSpent.fromArtifacts`, que chega a `ev.spell` no
  `enterModifier` (Coin of Mastery).
- Cartas que foram do campo para o cemitério no turno: `turnStats[p].toGraveyardFromBattlefield` (Continue?).
- O X escolhido chega ao filtro dos alvos como `(c as { x?: number }).x` (Here Comes a New Hero!). Na estimativa de
  "dá para conjurar?" ele vem indefinido.
- "Qualquer outro alvo": `{ ...t.any('…'), differentFrom: [0] }` (Special Move).
- Custo "sacrifique uma ficha": o analisador de custos não entende; acrescente a parte à mão com
  `HAB.cost.push({ k: 'sacrifice', n: 1, label, filter })` (Arcade Cabinet, Rat King).
- Gatilho atrasado que dispara mais de uma vez no turno: `delayed(c, id, { once: false, expiresTurn })` (Electric
  Seaweed). O padrão é disparar uma vez só.
- Nos testes, cada função de `tg.script.push` responde uma pergunta só; para várias perguntas iguais, empurre várias.
- `cartas/tartarugas.ts`: notas dos rulings de parceiro (seleção de personagem e "parceiro com"), de Mutagen e de
  Food; "sai do campo esta ou outra criatura sua que não é ficha"; sacrificar fichas no fim do combate.
- Dano "mais N" (CR 614.1a): gancho `damageBonus(c, fonte, alvo, combate)`, somado antes do dobro (Thor).
- Redirecionar o dano (CR 614.9): `ruleEffect(c, 'rule:redirectDamageTo', duração, { params: { controller, to } })`
  manda para `to` o dano que iria ao jogador e às criaturas dele (Heroic Sacrifice).
- "Só pode ser bloqueada por criaturas com [habilidade]" até o fim do turno:
  `untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:blockedOnlyByKeyword', params: { kw } }])` (Speed).
- Quantas vezes cada permanente foi virada no turno: `state.tappedThisTurn.times[id]` (Captain America, Living Legend).
- "Pela primeira vez em cada turno": `oncePerTurn: true` no gatilho; para dano simultâneo, `on.batch` somando o lote
  (Hercules).
- `cartas/vingadores.ts`: `ehHeroi`, `ehComandante`, `ehSeuComandante` (o de que você é dono, seja quem for que o
  controle), `tipoEscolhido`, `modificada` (CR 700.9) e `atacantes`.
- Equipar com restrição (CR 702.6c): `{ ...equip('{3}'), targets: [...], text: 'Equipar Hero {3}' }` (Hulkbuster Armor).
- Nos testes, `tg.choose` responde a primeira pergunta cujo texto casa: registre primeiro a escolha de texto mais
  específico ("escolha" casa também com "escolha o alvo").
- "Previna todo o dano de combate neste turno": `ruleEffect(c, 'rule:preventAllCombatDamage', { kind: 'endOfTurn' })`
  (Darkness).
- Custo "vire X permanentes": `{ k: 'tapPermanents', n: 'X', label, filter }`, com `xMax` na habilidade (Necron Overlord).
- Substituição de compra com condição: `drawReplaceApplies` ao lado de `drawReplace`, na mesma habilidade estática
  (Out of the Tombs). Sem a condição, a substituição vale sempre (Shared Fate).
- Redução de custo de habilidades ativadas de outras fontes: gancho
  `abilityCostModifier(c, jogador, fonte, def) => { reduce, minMana }` (Convergence of Dominion).
- "Sempre que este Veículo fica tripulado": evento `crewed`, emitido quando tripular resolve (Ghost Ark).
- Dar uma habilidade a cartas no cemitério até o fim do turno: `untilEndOfTurn(c, idsDoCemiterio, [{ k: 'addAbility', id }])`
  (Ghost Ark, desenterrar {3}).
- Tipo a mais em todas as zonas: habilidade estática com `offField: true` e `affects` (Biotransference, como o
  Maskwood Nexus).
- Conjurar por custo alternativo durante uma resolução: `castSpell(g, p, id, { key, label, zone, duringResolution: true,
  alt: { key, label, zone, mana: '', parts: [{ k: 'life', n }] } })` (Anrakyr).
- Recapitular sem custo de mana: `flashback('', [partes])` (Dread Return).
- `cartas/necrons.ts`: criatura artefato, criatura artefato ou Veículo, fichas Necron Warrior, "três terrenos com o
  mesmo nome" e as notas dos rulings de desenterrar.
- Nos testes, o texto da habilidade aparece na pergunta dos alvos: se dois alvos da mesma habilidade casam com o mesmo
  trecho, responda pelo que é oferecido (`d.items.find(...)`) em vez de `tg.choose`.
- "O seu total de pontos de vida não pode mudar": `ruleEffect(c, 'rule:lifeCantChange', duração, { players })`; vale em
  ganhar, perder e no dano (Teferi's Protection). Duração "até o seu próximo turno":
  `{ kind: 'untilYourNextTurn', player, sinceTurn }`.
- Proteção contra tudo para um jogador: `rule:playerProtection` com `params: { quality: 'everything' }` (The One Ring).
- Resistência a magia temporária do jogador: `rule:playerHexproof` com `players` (Dawn's Truce).
- Perda de vida em dobro (CR 614.1a): gancho `lifeLossDouble(c, jogador)`; vale também para a perda causada por dano
  (Bloodletter of Aclazotz).
- Prevenção: `rule:preventDamageByCreatures` (Ethereal Haze) e o escudo `rule:preventNextDamageTo` com
  `params: { to, left }`, que se gasta conforme o dano chega (Eiganjo Castle).
- "Os oponentes não podem conjurar mágicas que não são de criatura neste turno": `rule:cantCastNoncreature` com
  `players` (Permission Denied).
- Custo "exile N cartas [com filtro] da sua mão": `{ k: 'exileFromHand', n, label, filter }` (Force of Will). Custo
  alternativo sem mana: `altCosts: [{ key, label, zone: 'hand', mana: '', parts, condition }]` (Fierce Guardianship).
- Mana com restrição numa habilidade de mana: `mana(() => [['W', 'W']], { restriction: ID })`, com `defineFn(ID, …)`
  dizendo em que ela pode ser gasta (Codsworth).
- `cartas/jin.ts`: notas de infectar, proteção contra tudo e sair de fase; `ehHistorica`; `equipamentosDe`; e o gatilho
  "a criatura equipada ou encantada causa dano de combate a um jogador" (`c.event.jogador`, `dano`, `criatura`).
- Nos testes, as compras da etapa de compra tiram cartas do topo do grimório montado: ponha a carta que a busca deve
  achar depois das que serão compradas até lá.

## Testes

```ts
import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Infernal Grasp', () => {
  it('destrói a criatura alvo e você perde 2 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(0)).toBe(38);
  });
});
```

- `setup({ players, battlefield, hand, library, graveyard, exile, command, step, active, life, onStart })`: listas por jogador. Uma carta pode ser `'Nome'` ou `{ name, tapped, counters, ready: false (enjoo de invocação), commander: true, attachTo: 'Nome', damage }`. Padrão: dois jogadores, turno de Ana (0), primeira fase principal.
- Ações: `tg.cast(nome, método?)`, `tg.play(nome)`, `tg.activate(nome, trechoDoTexto?)`, `tg.pass()`, `tg.resolve()` (resolve o topo), `tg.resolveAll()`, `tg.passTo(etapa, deQuem?)`.
- Escolhas roteirizadas, registradas **antes** da ação que as pede: `tg.choose(trechoDoPrompt, [rótulos])`, `tg.yes(trecho, true|false)`, `tg.number(trecho, n)`, `tg.attack([[nome, jogador]])`, `tg.block([[bloqueador, atacante]])`, ou `tg.script.push((d) => resposta | null)`. Escolhas sem roteiro recebem a resposta padrão (primeira opção; pagamento automático).
- Consultas: `tg.find(nome, zona?, jogador?)`, `tg.bf(nome)`, `tg.names(jogador, zona)`, `tg.life(p)`, `tg.pt(id)`, `tg.state`, `tg.g`.
- Cartas usadas como figurantes precisam existir: veja `cartas/defs/` (as pendentes entram sem habilidades). Boas figurantes: `Indomitable Ancients` (2/10 sem texto), `Wall of Omens`, `Zetalpa, Primal Dawn`, `Sol Ring`, terrenos básicos.
- Teste o comportamento do Oracle, não a implementação: o que muda no jogo (zonas, vida, marcadores, fichas, quem decide o quê).

## Completar um deck em preparação (decks importados pelo Moxfield)

Um deck importado ou atualizado pela tela Decks só entra no saguão quando todas as cartas têm definição aqui.
Quando o anfitrião pedir "complete os decks em preparação":

1. `node ferramentas/decks.ts pendentes` lista, por deck, as cartas que faltam com custo, tipo, texto Oracle, número
   de rulings, fichas que a carta cria e o nome do arquivo (`cartas/defs/<slug>.ts`). Carta com alerta de layout
   (modal de duas faces, split, aventura, meld…) ou parceiro pode precisar de recurso novo no motor: anote no
   relatório, não improvise.
2. Implemente cada carta como acima. Os dados Oracle das cartas novas já estão em `gerado/cartas.json`, e
   `node ferramentas/ficha-carta.ts "Nome"` e `node ferramentas/rulings.ts "Nome"` funcionam para elas (os rulings
   vêm de `decks/rulings.json`). Terrenos simples: `node ferramentas/rascunho.ts --dry` mostra os que o gerador
   cobre. Fichas novas entram em `cartas/fichas.ts` e na tabela de `cartas/fichas.test.ts`.
3. `node ferramentas/decks.ts gerar` põe no saguão as versões cujas cartas ficaram todas prontas (o servidor faz o
   mesmo ao subir) e regera `gerado/decks.json`.
4. Rode `npx tsc --noEmit -p tsconfig.json` e a suíte inteira (`npx vitest run`), e faça commit de `cartas/defs/`,
   `decks/` e `gerado/`.
