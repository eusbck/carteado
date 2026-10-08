// Fichas (CR 111) criadas pelas cartas dos decks. Cada uma aponta para a imagem da ficha
// correspondente em ../cartas/data (pelo nome, força/resistência e cores).

import { activated, controllerOf, cost, decayed, defineToken, gainLife, keywords, loseLife, mana, on, t, triggered, untilEndOfTurn, type AbilityDef } from '../motor/api.ts';
import { fichasOracle } from '../motor/oracle.ts';
import type { Color } from '../motor/types.ts';

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
export const Shark = tokenXX('Shark', 'Shark', ['Creature'], ['Shark'], ['U'], keywords('flying'));

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
