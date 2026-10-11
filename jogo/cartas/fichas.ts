// Fichas (CR 111) criadas pelas cartas dos decks. Cada uma aponta para a imagem da ficha
// correspondente em ../cartas/data (pelo nome, força/resistência e cores).

import { activated, addCounters, chars, chooseItems, controlledBy, controllerOf, cost, createTokens, decayed, defineToken, draw, gainLife, is, isLand, isType, keywords, lkiChars, lookAndArrange, loseLife, mana, moveObjects, nameOf, objItem, on, putOntoBattlefield, sacrifice, t, tgt, triggered, untilEndOfTurn, yesNo, type AbilityDef, type G, type Gen } from '../motor/api.ts';
import type { Ctx } from '../motor/defs.ts';
import { fichasOracle } from '../motor/oracle.ts';
import type { Color, ObjId } from '../motor/types.ts';

function img(name: string, p: number | null, t: number | null, colors?: Color[], text?: string): string | undefined {
  const cands = fichasOracle.filter((f) => f.faces[0].name === name && f.faces[0].power === p && f.faces[0].toughness === t);
  const byColor = colors ? cands.filter((f) => f.faces[0].colors.length === colors.length && colors.every((c) => f.faces[0].colors.includes(c))) : cands;
  const byText = text ? byColor.filter((f) => f.faces[0].oracleText.includes(text)) : byColor;
  return (byText[0] ?? byColor[0] ?? cands[0])?.oracleId;
}

function token(id: string, name: string, types: string[], subtypes: string[], colors: Color[], p: number | null, t: number | null, abilities: AbilityDef[] = [], imageText?: string) {
  return defineToken({ id, name, types, subtypes, colors, power: p, toughness: t, abilities, image: img(name, p, t, colors, imageText) });
}

/** ficha X/X: a força e a resistência vêm do efeito que a cria (a impressa tem * / *) */
function tokenXX(id: string, name: string, types: string[], subtypes: string[], colors: Color[], abilities: AbilityDef[] = []) {
  return defineToken({ id, name, types, subtypes, colors, power: 0, toughness: 0, abilities, image: img(name, null, null, colors) });
}

// Fichas predefinidas (CR 111.10a)
export const Treasure = defineToken({
  id: 'Treasure', name: 'Treasure', types: ['Artifact'], subtypes: ['Treasure'], colors: [], power: null, toughness: null,
  abilities: [mana('any', { cost: '{T}, Sacrifice this token', text: '{T}, Sacrifique esta ficha: Adicione uma mana de qualquer cor.' })],
  image: fichasOracle.find((f) => f.name === 'Treasure')?.oracleId,
});

export const EldraziSpawn = token('Eldrazi Spawn', 'Eldrazi Spawn', ['Creature'], ['Eldrazi', 'Spawn'], [], 0, 1, [
  mana('C', { cost: 'Sacrifice this token', text: 'Sacrifique esta ficha: Adicione {C}.' }),
]);

/** Pest de Witherbloom: "Quando esta ficha morre, você ganha 1 de vida." */
export const Pest = token('Pest', 'Pest', ['Creature'], ['Pest'], ['B', 'G'], 1, 1, [
  triggered(on.selfDies(), function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Quando esta ficha morre, você ganha 1 de vida.' }),
], 'dies');

/** Pest de Moseo: "Sempre que esta ficha ataca, você ganha 1 de vida." */
export const PestAttacker = token('Pest (ataque)', 'Pest', ['Creature'], ['Pest'], ['B', 'G'], 1, 1, [
  triggered(on.selfAttacks(), function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'Sempre que esta ficha ataca, você ganha 1 de vida.' }),
], 'attacks');

export const Inkling = token('Inkling', 'Inkling', ['Creature'], ['Inkling'], ['W', 'B'], 2, 1, keywords('flying'));
export const SpiritRW = token('Spirit 3/2', 'Spirit', ['Creature'], ['Spirit'], ['R', 'W'], 3, 2);
export const SpiritFlying = token('Spirit 1/1', 'Spirit', ['Creature'], ['Spirit'], ['W'], 1, 1, keywords('flying'));
export const Cat = token('Cat', 'Cat', ['Creature'], ['Cat'], ['W'], 2, 2);
export const Pegasus = token('Pegasus', 'Pegasus', ['Creature'], ['Pegasus'], ['W'], 2, 2, keywords('flying'));
export const Bird = token('Bird', 'Bird', ['Creature'], ['Bird'], ['W'], 1, 1, keywords('flying'));
export const Demon = token('Demon', 'Demon', ['Creature'], ['Demon'], ['B'], 5, 5, keywords('flying'));
/** Dragon Illusion X/X: força e resistência definidas na criação (cópia com exceção) */
export const DragonIllusion = tokenXX('Dragon Illusion', 'Dragon Illusion', ['Creature'], ['Dragon', 'Illusion'], ['R'], keywords('flying', 'haste'));
export const Elemental11 = token('Elemental 1/1', 'Elemental', ['Creature'], ['Elemental'], ['U', 'R'], 1, 1);
export const Elemental44 = token('Elemental 4/4', 'Elemental', ['Creature'], ['Elemental'], ['U', 'R'], 4, 4);
export const Elemental33 = token('Elemental 3/3', 'Elemental', ['Creature'], ['Elemental'], ['U', 'R'], 3, 3, keywords('flying'));
/** Elemental X/X com voar e ímpeto (Rootha) */
export const ElementalXX = tokenXX('Elemental X/X', 'Elemental', ['Creature'], ['Elemental'], ['U', 'R'], keywords('flying', 'haste'));
export const ElfWarrior = token('Elf Warrior', 'Elf Warrior', ['Creature'], ['Elf', 'Warrior'], ['G'], 1, 1);
export const Goat = token('Goat', 'Goat', ['Creature'], ['Goat'], ['W'], 0, 1);
export const HumanSoldier = token('Human Soldier', 'Human Soldier', ['Creature'], ['Human', 'Soldier'], ['W'], 1, 1);
export const InsectBlack = token('Insect', 'Insect', ['Creature'], ['Insect'], ['B'], 1, 1);
export const InsectFlyingDeathtouch = token('Insect voador', 'Insect', ['Creature'], ['Insect'], ['G'], 1, 1, keywords('flying', 'deathtouch'));
export const Moogle = token('Moogle', 'Moogle', ['Creature'], ['Moogle'], ['W'], 1, 2, keywords('lifelink'));
export const PhyrexianGerm = token('Phyrexian Germ', 'Phyrexian Germ', ['Creature'], ['Phyrexian', 'Germ'], ['B'], 0, 0);
export const PhyrexianMyr = token('Phyrexian Myr', 'Phyrexian Myr', ['Artifact', 'Creature'], ['Phyrexian', 'Myr'], ['U'], 2, 1);
export const Rogue = token('Rogue', 'Rogue', ['Creature'], ['Rogue'], ['B'], 2, 2);
export const Saproling = token('Saproling', 'Saproling', ['Creature'], ['Saproling'], ['G'], 1, 1);
export const Scarecrow = token('Scarecrow', 'Scarecrow', ['Artifact', 'Creature'], ['Scarecrow'], [], 2, 2);
export const SnakeGreen = token('Snake verde', 'Snake', ['Creature'], ['Snake'], ['G'], 1, 1, keywords('deathtouch'));
export const SnakeBlack = token('Snake preta', 'Snake', ['Creature'], ['Snake'], ['B'], 1, 1, keywords('deathtouch'));
export const Spider = token('Spider', 'Spider', ['Creature'], ['Spider'], ['G'], 1, 2, keywords('reach'));
export const Treefolk = token('Treefolk', 'Treefolk', ['Creature'], ['Treefolk'], ['G'], 3, 4, keywords('reach'));
export const Wall = token('Wall', 'Wall', ['Creature'], ['Wall'], ['W'], 1, 3, keywords('defender'));
export const Worm = token('Worm', 'Worm', ['Creature'], ['Worm'], ['B', 'G'], 1, 1);
export const Zombie = token('Zombie', 'Zombie', ['Creature'], ['Zombie'], ['B'], 2, 2, decayed());

// fichas dos decks importados pelo Moxfield (Multiverse Reforged e Wretched Ranks)
/** Zombie 2/2 preta sem habilidades (a 'Zombie' acima é a com decaimento) */
export const Zombie22 = defineToken({
  id: 'Zombie 2/2', name: 'Zombie', types: ['Creature'], subtypes: ['Zombie'], colors: ['B'], power: 2, toughness: 2, abilities: [],
  image: fichasOracle.find((f) => f.faces[0].name === 'Zombie' && f.faces[0].power === 2 && f.faces[0].toughness === 2 && !f.faces[0].oracleText)?.oracleId,
});
export const ZombieArmy = token('Zombie Army', 'Zombie Army', ['Creature'], ['Zombie', 'Army'], ['B'], 0, 0);
export const Soldier = token('Soldier', 'Soldier', ['Creature'], ['Soldier'], ['W'], 1, 1);
export const Warrior = token('Warrior', 'Warrior', ['Creature'], ['Warrior'], ['W'], 1, 1);
export const Human = token('Human', 'Human', ['Creature'], ['Human'], ['W'], 1, 1);
export const Citizen = token('Citizen', 'Citizen', ['Creature'], ['Citizen'], ['G', 'W'], 1, 1);
export const InsectWhite = token('Insect 2/1', 'Insect', ['Creature'], ['Insect'], ['W'], 2, 1, keywords('flying'));
export const Angel = token('Angel', 'Angel', ['Creature'], ['Angel'], ['W'], 4, 4, keywords('flying'));
export const KoboldsOfKherKeep = token('Kobolds of Kher Keep', 'Kobolds of Kher Keep', ['Creature'], ['Kobold'], ['R'], 0, 1);
export const Goblin = token('Goblin', 'Goblin', ['Creature'], ['Goblin'], ['R'], 1, 1);
export const PhyrexianGoblin = token('Phyrexian Goblin', 'Phyrexian Goblin', ['Creature'], ['Phyrexian', 'Goblin'], ['R'], 1, 1);
export const Myr = token('Myr', 'Myr', ['Artifact', 'Creature'], ['Myr'], [], 1, 1);
export const Thopter = token('Thopter', 'Thopter', ['Artifact', 'Creature'], ['Thopter'], [], 1, 1, keywords('flying'));
export const Shark = tokenXX('Shark', 'Shark', ['Creature'], ['Shark'], ['U'], keywords('flying'));
/**
 * Jace (CR 701.71a, "empower Jace"): planeswalker azul com 0 de lealdade, "[−1]: Vigiar 1" e "[−3]: Compre uma carta".
 * Lealdade 0 impressa: quem a cria põe os marcadores logo em seguida. A palavra-chave 'surveil' segue a lista da ficha
 * impressa (Scryfall); vigiar é uma ação de palavra-chave (CR 701.25), não muda nada nas regras.
 */
export const Jace = token('Jace', 'Jace', ['Planeswalker'], ['Jace'], ['U'], null, null, [
  activated('−1', function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, { kw: 'surveil', text: '−1: Vigiar 1.' }),
  activated('−3', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '−3: Compre uma carta.' }),
]);

/**
 * Fortalecer Jace N (empower Jace): sem uma ficha de planeswalker Jace sua, crie a ficha Jace acima; depois escolha uma
 * ficha de planeswalker Jace sua e ponha N marcadores de lealdade nela. Jace que não é ficha não serve, e com uma
 * ficha já no campo não se cria outra (rulings de Fatehold Charm e Plan for All Outcomes).
 */
export function* empowerJace(c: Ctx, n: number): Gen<void> {
  const fichas = () => controlledBy(c.g, c.you, (id) => c.g.state.objects[id].isToken && isType(c.g, id, 'Planeswalker') && chars(c.g, id).subtypes.includes('Jace'));
  if (!fichas().length) yield* createTokens(c.g, c.you, 'Jace', 1);
  const opcoes = fichas();
  if (!opcoes.length) return;
  let alvo = opcoes[0];
  if (opcoes.length > 1) {
    const [id] = yield* chooseItems(c.g, c.you, `Fortalecer Jace ${n}: escolha a ficha de Jace que recebe os marcadores de lealdade`, opcoes.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
    alvo = Number(id);
  }
  addCounters(c.g, { kind: 'obj', id: alvo }, 'loyalty', n, c.you);
  c.g.log(`${c.g.state.players[c.you].name} fortalece Jace ${n}.`);
}

/**
 * Explorar (CR 701.44a): o controlador do permanente revela a carta do topo do grimório. Se for carta de terreno,
 * põe na mão; senão, põe um marcador +1/+1 no permanente e pode pôr a carta revelada no cemitério.
 */
export function* explore(g: G, id: ObjId): Gen<void> {
  // CR 701.44c: se o permanente já saiu do campo, a última informação conhecida diz quem o controlava
  const lki = lkiChars(g, id);
  if (!lki) return;
  const p = g.state.objects[id] ? controllerOf(g, id) : lki.controller;
  const top = g.state.zones.library[p][0];
  if (top !== undefined) {
    g.log(`${g.state.players[p].name} revela ${nameOf(g, top)} do topo do grimório (explorar).`, { rule: '701.44a' });
    if (isLand(g, top)) { yield* moveObjects(g, [{ id: top, to: 'hand' }], 'explore'); return; }
  }
  // sem carta de terreno revelada (nem com o grimório vazio): marcador +1/+1, se ainda estiver no campo (CR 701.44b)
  if (g.state.objects[id]?.zone === 'battlefield') addCounters(g, { kind: 'obj', id }, '+1/+1', 1, p);
  if (top === undefined || g.state.zones.library[p][0] !== top) return;
  if (yield* yesNo(g, p, `Explorar: pôr ${nameOf(g, top)} no cemitério? Senão, a carta fica no topo do grimório.`, 'Pôr no cemitério', 'Deixar no topo')) {
    yield* moveObjects(g, [{ id: top, to: 'graveyard' }], 'explore');
  }
}

/** Map (CR 111.10s): "{1}, {T}, Sacrifique esta ficha: A criatura alvo que você controla explora. Ative só como feitiço." */
export const MapToken = defineToken({
  id: 'Map', name: 'Map', types: ['Artifact'], subtypes: ['Map'], colors: [], power: null, toughness: null,
  abilities: [
    // kw 'explore': a ficha impressa lista explorar entre as palavras-chave (cartas/fichas.test.ts confere)
    activated('{1}, {T}, Sacrifice this artifact', function* (c) {
      const alvo = tgt(c);
      if (alvo !== null) yield* explore(c.g, alvo);
    }, {
      kw: 'explore', timing: 'sorcery', targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      text: '{1}, {T}, Sacrifique este artefato: A criatura alvo que você controla explora. Ative apenas como um feitiço.',
    }),
  ],
  image: fichasOracle.find((f) => f.name === 'Map')?.oracleId,
});

/**
 * Incubator (incubar, CR 701.53): ficha de duas faces (CR 111.10i). Frente: artefato Incubator incolor com "{2}:
 * Transforme esta ficha"; verso: criatura artefato Phyrexian 0/0 incolor chamada Phyrexian Token (nome do CR 111.10i;
 * a ficha impressa diz só "Phyrexian"). Os marcadores +1/+1 do incubar ficam na ficha quando ela transforma (CR 712.18).
 */
import { transformFrom } from '../motor/api.ts';
export const Incubator = defineToken({
  id: 'Incubator', name: 'Incubator', types: ['Artifact'], subtypes: ['Incubator'], colors: [], power: null, toughness: null,
  abilities: [
    // CR 701.27f: só transforma se não transformou desde que a habilidade foi para a pilha
    activated('{2}', function* (c) { transformFrom(c.g, c.source, 0); }, { kw: 'transform', text: '{2}: Transforme este artefato.' }),
  ],
  back: { name: 'Phyrexian Token', types: ['Artifact', 'Creature'], subtypes: ['Phyrexian'], colors: [], power: 0, toughness: 0, abilities: [] },
  image: fichasOracle.find((f) => f.name === 'Incubator // Phyrexian')?.oracleId,
});

/** Phyrexian Mite (Skrelv's Hive, White Sun's Twilight): artefato criatura incolor 1/1, tóxico 1, não pode bloquear */
import { keyword, toxic } from '../motor/api.ts';
export const PhyrexianMite = token('Phyrexian Mite', 'Phyrexian Mite', ['Artifact', 'Creature'], ['Phyrexian', 'Mite'], [], 1, 1, [
  toxic(1), { ...keyword('cantBlock'), text: 'Esta criatura não pode bloquear.' },
]);

/**
 * Contract (Scriv, the Obligator): Aura que encanta criatura. "Sempre que a criatura encantada ataca, ela recebe +2/+0
 * até o fim do turno se estiver atacando um dos seus oponentes. Caso contrário, o controlador dela perde 2 de vida."
 */
export const Contract = defineToken({
  id: 'Contract', name: 'Contract', types: ['Enchantment'], subtypes: ['Aura'], colors: ['W'], power: null, toughness: null,
  enchant: t.creature(undefined, 'criatura'),
  abilities: [
    triggered(on.custom((e, c) => {
      const enc = c.g.state.objects[c.source]?.attachedTo;
      if (e.type !== 'attackers' || enc == null) return false;
      const a = e.attackers.find((x) => x.obj === enc);
      return a ? { criatura: enc, alvo: a.target } : false;
    }), function* (c) {
      const id = c.event.criatura as number;
      const alvo = c.event.alvo as { kind: string; id: number };
      // "um dos seus oponentes": o jogador atacado (não um planeswalker) é oponente do controlador da Aura
      if (alvo.kind === 'player' && c.g.isOpponent(c.you, alvo.id)) {
        if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'pt', p: 2, t: 0 }]);
      } else if (c.g.state.objects[id]) loseLife(c.g, controllerOf(c.g, id), 2, c.source);
    }, { text: 'Sempre que a criatura encantada ataca, ela recebe +2/+0 até o fim do turno se estiver atacando um dos seus oponentes. Caso contrário, o controlador dela perde 2 de vida.' }),
  ],
  image: fichasOracle.find((f) => f.name === 'Contract')?.oracleId,
});

void activated; void cost;

// lote2-b
/** Cat 1/1 verde (Rin and Seri, Inseparable) */
export const CatVerde11 = token('Cat verde 1/1', 'Cat', ['Creature'], ['Cat'], ['G'], 1, 1);
/** Dog 1/1 branco (Rin and Seri, Inseparable) */
export const DogBranco11 = token('Dog branco 1/1', 'Dog', ['Creature'], ['Dog'], ['W'], 1, 1);
/** Cat 2/2 verde com ímpeto (Jinnie Fay, Jetmir's Second) */
export const CatVerde22 = token('Cat verde 2/2 ímpeto', 'Cat', ['Creature'], ['Cat'], ['G'], 2, 2, keywords('haste'));
/** Dog 3/1 verde com vigilância (Jinnie Fay, Jetmir's Second) */
export const DogVerde31 = token('Dog verde 3/1 vigilância', 'Dog', ['Creature'], ['Dog'], ['G'], 3, 1, keywords('vigilance'));
// lote2-c
export const Ninja = token('Ninja', 'Ninja', ['Creature'], ['Ninja'], ['B'], 1, 1);
export const Elemental55 = token('Elemental 5/5', 'Elemental', ['Creature'], ['Elemental'], ['U', 'R'], 5, 5, keywords('flying'));
/** Mutagen (ficha predefinida, CR 111.10): "{1}, {T}, Sacrifique esta ficha: ponha um marcador +1/+1 na criatura alvo. Ative só como feitiço." */
export const Mutagen = defineToken({
  id: 'Mutagen', name: 'Mutagen', types: ['Artifact'], subtypes: ['Mutagen'], colors: [], power: null, toughness: null,
  abilities: [activated('{1}, {T}, Sacrifice this token', function* (c) {
    const id = tgt(c);
    if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
  }, { targets: [t.creature()], timing: 'sorcery', text: '{1}, {T}, Sacrifique esta ficha: ponha um marcador +1/+1 na criatura alvo. Ative só como feitiço.' })],
  image: fichasOracle.find((f) => f.name === 'Mutagen')?.oracleId,
});
// lote2-e
import { selfGets as selfGetsLote2E } from '../motor/api.ts';
/** Rat 1/1 preto (Big Apple, 3 a.m.) */
export const Rat = token('Rat', 'Rat', ['Creature'], ['Rat'], ['B'], 1, 1);
/** Elemental 8/8 verde e branco com vigilância (Grove of the Guardian) */
export const Elemental88 = token('Elemental 8/8', 'Elemental', ['Creature'], ['Elemental'], ['G', 'W'], 8, 8, keywords('vigilance'));
/** Construct 0/0 artefato: "Esta ficha recebe +1/+1 para cada artefato que você controla." (Urza's Saga) */
export const ConstructArtifacts = token('Construct (artefatos)', 'Construct', ['Artifact', 'Creature'], ['Construct'], [], 0, 0, [
  selfGetsLote2E((c) => {
    const n = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length;
    return [{ k: 'pt', p: n, t: n }];
  }, 'Esta ficha recebe +1/+1 para cada artefato que você controla.'),
], 'artifact you control');
// lote2-f
import { defineFn } from '../motor/api.ts';
/** Plant (Dowsing Dagger): criatura Plant verde 0/2 com defensor */
export const Plant = token('Plant', 'Plant', ['Creature'], ['Plant'], ['G'], 0, 2, keywords('defender'));
/** Vibranium (The Great Mound): artefato indestrutível; "{T}: Adicione {C}. Essa mana não pode ser gasta para conjurar mágica que não seja de artefato." */
const VIBRANIUM_SO_ARTEFATO = 'Vibranium:soArtefato';
defineFn(VIBRANIUM_SO_ARTEFATO, (g: G, purpose: { kind: string; obj?: number }) =>
  purpose.kind !== 'spell' || (purpose.obj !== undefined && isType(g, purpose.obj, 'Artifact'))); // CR 106.6
export const Vibranium = defineToken({
  id: 'Vibranium', name: 'Vibranium', types: ['Artifact'], subtypes: ['Vibranium'], colors: [], power: null, toughness: null,
  abilities: [
    keyword('indestructible'),
    mana('C', { restriction: VIBRANIUM_SO_ARTEFATO, text: '{T}: Adicione {C}. Essa mana não pode ser gasta para conjurar uma mágica que não seja de artefato.' }),
  ],
  image: fichasOracle.find((f) => f.name === 'Vibranium')?.oracleId,
});
// lote2-g
/** Dragon 5/5 vermelha com voar (Lathliss, Dragon Queen; Dragonmaster Outcast; Skyline Despot) */
export const Dragon55 = token('Dragon 5/5', 'Dragon', ['Creature'], ['Dragon'], ['R'], 5, 5, keywords('flying'));
/** Dragon 6/6 vermelha com voar (Utvara Hellkite) */
export const Dragon66 = token('Dragon 6/6', 'Dragon', ['Creature'], ['Dragon'], ['R'], 6, 6, keywords('flying'));
// lote2-d: fichas predefinidas e das mecânicas de criaturas (motor/criaturas.ts)
import { changeling } from '../motor/api.ts';
/** Food (CR 111.10b): "{2}, {T}, Sacrifique esta ficha: Você ganha 3 de vida." */
export const Food = defineToken({
  id: 'Food', name: 'Food', types: ['Artifact'], subtypes: ['Food'], colors: [], power: null, toughness: null,
  abilities: [activated('{2}, {T}, Sacrifice this token', function* (c) { gainLife(c.g, c.you, 3, c.source); }, { text: '{2}, {T}, Sacrifique esta ficha: Você ganha 3 de vida.' })],
  image: fichasOracle.find((f) => f.name === 'Food')?.oracleId,
});
/** Clue (CR 111.10f): "{2}, Sacrifique esta ficha: Compre uma carta." */
export const Clue = defineToken({
  id: 'Clue', name: 'Clue', types: ['Artifact'], subtypes: ['Clue'], colors: [], power: null, toughness: null,
  abilities: [activated('{2}, Sacrifice this token', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{2}, Sacrifique esta ficha: Compre uma carta.' })],
  image: fichasOracle.find((f) => f.name === 'Clue')?.oracleId,
});
/** Blood (CR 111.10g): "{1}, {T}, Descarte uma carta, Sacrifique esta ficha: Compre uma carta." */
export const Blood = defineToken({
  id: 'Blood', name: 'Blood', types: ['Artifact'], subtypes: ['Blood'], colors: [], power: null, toughness: null,
  abilities: [activated('{1}, {T}, Discard a card, Sacrifice this token', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{1}, {T}, Descarte uma carta, Sacrifique esta ficha: Compre uma carta.' })],
  image: fichasOracle.find((f) => f.name === 'Blood')?.oracleId,
});
/** Orc Army 0/0 preta (reunir Orcs, CR 701.47a) */
export const OrcArmy = token('Orc Army', 'Orc Army', ['Creature'], ['Orc', 'Army'], ['B'], 0, 0);
/** Wraith 3/3 preta com ameaçar (In the Darkness Bind Them, Lord of the Nazgûl) */
export const Wraith = token('Wraith', 'Wraith', ['Creature'], ['Wraith'], ['B'], 3, 3, keywords('menace'));
/** Robot Villain 2/2 incolor (Ultron, Unlimited) */
export const RobotVillain = token('Robot Villain', 'Robot Villain', ['Artifact', 'Creature'], ['Robot', 'Villain'], [], 2, 2);
/** Warrior 1/1 vermelha (mobilizar, CR 702.181a) */
export const WarriorRed = token('Warrior vermelho', 'Warrior', ['Creature'], ['Warrior'], ['R'], 1, 1);
/** Shapeshifter 1/1 incolor com polimorfo (Crib Swap) */
export const Shapeshifter = token('Shapeshifter', 'Shapeshifter', ['Creature'], ['Shapeshifter'], [], 1, 1, [changeling()]);
/** Dragon 4/4 vermelha com voar (The Elder Dragon War) */
export const Dragon44 = token('Dragon 4/4', 'Dragon', ['Creature'], ['Dragon'], ['R'], 4, 4, keywords('flying'));
/** Vampire 1/1 branca e preta com vínculo com a vida (Glass-Cast Heart) */
export const VampireWB = token('Vampire 1/1', 'Vampire', ['Creature'], ['Vampire'], ['W', 'B'], 1, 1, keywords('lifelink'));
// lote2 (integração)
/** Drake 2/2 azul com voar (Talrand's Invocation) */
export const Drake22 = token('Drake', 'Drake', ['Creature'], ['Drake'], ['U'], 2, 2, keywords('flying'));
/** Demon X/X preta com voar (Reign of the Pit): força e resistência definidas na criação */
export const DemonXX = tokenXX('Demon X/X', 'Demon', ['Creature'], ['Demon'], ['B'], keywords('flying'));
/** Lightning Rager 5/1 vermelha (Rite of the Raging Storm): atropelar, ímpeto e sacrifício no início da etapa final */
export const LightningRager = token('Lightning Rager', 'Lightning Rager', ['Creature'], ['Elemental'], ['R'], 5, 1, [
  ...keywords('trample', 'haste'),
  triggered(on.endStep('each'), function* (c) {
    if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
  }, { text: 'No início da etapa final, sacrifique esta ficha.' }),
]);
/** Elemental 0/1 vermelha (Rekindling Phoenix): na sua manutenção, sacrifique-a e devolva a Rekindling Phoenix alvo do
 *  seu cemitério para o campo, com ímpeto até o fim do turno */
export const ElementalFenix = token('Elemental 0/1', 'Elemental', ['Creature'], ['Elemental'], ['R'], 0, 1, [
  triggered(on.upkeep('you'), function* (c) {
    const carta = tgt(c);
    // ruling 1: sem a carta alvo no cemitério, a ficha não é sacrificada
    if (carta === null) return;
    if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
    const [nova] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
    if (nova !== undefined) untilEndOfTurn(c, [nova], [{ k: 'addKeyword', kw: 'haste' }]);
  }, {
    // ruling 2: procura uma carta com o nome Rekindling Phoenix
    targets: [t.card('graveyard', (c, id) => chars(c.g, id).name === 'Rekindling Phoenix', 'carta com o nome Rekindling Phoenix alvo no seu cemitério', 'you')],
    text: 'No início da sua manutenção, sacrifique esta ficha e devolva a carta com o nome Rekindling Phoenix alvo do seu cemitério para o campo de batalha. Ela ganha ímpeto até o fim do turno.',
  }),
]);
/** Wall 0/3 incolor com defensor e alcance (Invisible Woman) */
export const Wall03 = token('Wall 0/3', 'Wall', ['Creature'], ['Wall'], [], 0, 3, keywords('defender', 'reach'));
/** Ox 2/2 branco (Bovine Intervention) */
export const Ox = token('Ox', 'Ox', ['Creature'], ['Ox'], ['W'], 2, 2);
/** Merfolk 1/1 azul (Namor, Atlantean King) */
export const Merfolk = token('Merfolk', 'Merfolk', ['Creature'], ['Merfolk'], ['U'], 1, 1);
/** Construct 4/4 incolor, artefato, com voar e ímpeto (The Fantasticar) */
export const Construct44 = token('Construct 4/4', 'Construct', ['Artifact', 'Creature'], ['Construct'], [], 4, 4, keywords('flying', 'haste'));
/** Villain 2/1 preto com ameaçar (Madame Hydra, Endless Ranks of HYDRA) */
export const Villain = token('Villain', 'Villain', ['Creature'], ['Villain'], ['B'], 2, 1, keywords('menace'));
/** Ape Villain 3/3 vermelho com ímpeto (Red Ghost, Intangible Genius) */
export const ApeVillain = token('Ape Villain', 'Ape Villain', ['Creature'], ['Ape', 'Villain'], ['R'], 3, 3, keywords('haste'));
/** Shapeshifter 3/2 incolor com polimorfo (Black Market Connections) */
export const Shapeshifter32 = token('Shapeshifter 3/2', 'Shapeshifter', ['Creature'], ['Shapeshifter'], [], 3, 2, [changeling()]);
