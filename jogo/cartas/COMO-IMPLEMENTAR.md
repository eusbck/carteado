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
