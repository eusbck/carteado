// Fichas (CR 111): cada ficha confere com a ficha impressa (dados Oracle em cartas/data) e as que têm
// habilidades são testadas em jogo.
import { describe, expect, it } from 'vitest';
import { setup } from '../testes/harness.ts';
import { chars, hasKw } from '../motor/chars.ts';
import { registry } from '../motor/defs.ts';
import { fichasOracle } from '../motor/oracle.ts';
import { createTokens } from '../motor/api.ts';
import { manaOptions } from '../motor/costs.ts';

// id → [nome, tipos, subtipos, cores, força, resistência, palavras-chave]
// força/resistência null = X/X definida na criação
const esperadas: Record<string, [string, string[], string[], string[], number | null, number | null, string[]]> = {
  'Treasure': ['Treasure', ['Artifact'], ['Treasure'], [], null, null, []],
  'Eldrazi Spawn': ['Eldrazi Spawn', ['Creature'], ['Eldrazi', 'Spawn'], [], 0, 1, []],
  'Pest': ['Pest', ['Creature'], ['Pest'], ['B', 'G'], 1, 1, []],
  'Pest (ataque)': ['Pest', ['Creature'], ['Pest'], ['B', 'G'], 1, 1, []],
  'Inkling': ['Inkling', ['Creature'], ['Inkling'], ['B', 'W'], 2, 1, ['flying']],
  'Spirit 3/2': ['Spirit', ['Creature'], ['Spirit'], ['R', 'W'], 3, 2, []],
  'Spirit 1/1': ['Spirit', ['Creature'], ['Spirit'], ['W'], 1, 1, ['flying']],
  'Cat': ['Cat', ['Creature'], ['Cat'], ['W'], 2, 2, []],
  'Pegasus': ['Pegasus', ['Creature'], ['Pegasus'], ['W'], 2, 2, ['flying']],
  'Bird': ['Bird', ['Creature'], ['Bird'], ['W'], 1, 1, ['flying']],
  'Demon': ['Demon', ['Creature'], ['Demon'], ['B'], 5, 5, ['flying']],
  'Dragon Illusion': ['Dragon Illusion', ['Creature'], ['Dragon', 'Illusion'], ['R'], null, null, ['flying', 'haste']],
  'Elemental 1/1': ['Elemental', ['Creature'], ['Elemental'], ['R', 'U'], 1, 1, []],
  'Elemental 4/4': ['Elemental', ['Creature'], ['Elemental'], ['R', 'U'], 4, 4, []],
  'Elemental 3/3': ['Elemental', ['Creature'], ['Elemental'], ['R', 'U'], 3, 3, ['flying']],
  'Elemental X/X': ['Elemental', ['Creature'], ['Elemental'], ['R', 'U'], null, null, ['flying', 'haste']],
  'Elf Warrior': ['Elf Warrior', ['Creature'], ['Elf', 'Warrior'], ['G'], 1, 1, []],
  'Goat': ['Goat', ['Creature'], ['Goat'], ['W'], 0, 1, []],
  'Human Soldier': ['Human Soldier', ['Creature'], ['Human', 'Soldier'], ['W'], 1, 1, []],
  'Insect': ['Insect', ['Creature'], ['Insect'], ['B'], 1, 1, []],
  'Insect voador': ['Insect', ['Creature'], ['Insect'], ['G'], 1, 1, ['flying', 'deathtouch']],
  'Moogle': ['Moogle', ['Creature'], ['Moogle'], ['W'], 1, 2, ['lifelink']],
  'Phyrexian Germ': ['Phyrexian Germ', ['Creature'], ['Phyrexian', 'Germ'], ['B'], 0, 0, []],
  'Phyrexian Myr': ['Phyrexian Myr', ['Artifact', 'Creature'], ['Phyrexian', 'Myr'], ['U'], 2, 1, []],
  'Rogue': ['Rogue', ['Creature'], ['Rogue'], ['B'], 2, 2, []],
  'Saproling': ['Saproling', ['Creature'], ['Saproling'], ['G'], 1, 1, []],
  'Scarecrow': ['Scarecrow', ['Artifact', 'Creature'], ['Scarecrow'], [], 2, 2, []],
  'Snake verde': ['Snake', ['Creature'], ['Snake'], ['G'], 1, 1, ['deathtouch']],
  'Snake preta': ['Snake', ['Creature'], ['Snake'], ['B'], 1, 1, ['deathtouch']],
  'Spider': ['Spider', ['Creature'], ['Spider'], ['G'], 1, 2, ['reach']],
  'Treefolk': ['Treefolk', ['Creature'], ['Treefolk'], ['G'], 3, 4, ['reach']],
  'Wall': ['Wall', ['Creature'], ['Wall'], ['W'], 1, 3, ['defender']],
  'Worm': ['Worm', ['Creature'], ['Worm'], ['B', 'G'], 1, 1, []],
  'Zombie': ['Zombie', ['Creature'], ['Zombie'], ['B'], 2, 2, ['decayed']],
  'Zombie 2/2': ['Zombie', ['Creature'], ['Zombie'], ['B'], 2, 2, []],
  'Zombie Army': ['Zombie Army', ['Creature'], ['Zombie', 'Army'], ['B'], 0, 0, []],
  'Soldier': ['Soldier', ['Creature'], ['Soldier'], ['W'], 1, 1, []],
  'Warrior': ['Warrior', ['Creature'], ['Warrior'], ['W'], 1, 1, []],
  'Human': ['Human', ['Creature'], ['Human'], ['W'], 1, 1, []],
  'Citizen': ['Citizen', ['Creature'], ['Citizen'], ['G', 'W'], 1, 1, []],
  'Insect 2/1': ['Insect', ['Creature'], ['Insect'], ['W'], 2, 1, ['flying']],
  'Angel': ['Angel', ['Creature'], ['Angel'], ['W'], 4, 4, ['flying']],
  'Kobolds of Kher Keep': ['Kobolds of Kher Keep', ['Creature'], ['Kobold'], ['R'], 0, 1, []],
  'Goblin': ['Goblin', ['Creature'], ['Goblin'], ['R'], 1, 1, []],
  'Phyrexian Goblin': ['Phyrexian Goblin', ['Creature'], ['Phyrexian', 'Goblin'], ['R'], 1, 1, []],
  'Myr': ['Myr', ['Artifact', 'Creature'], ['Myr'], [], 1, 1, []],
  'Shark': ['Shark', ['Creature'], ['Shark'], ['U'], null, null, ['flying']],
  'Map': ['Map', ['Artifact'], ['Map'], [], null, null, ['explore']],
  'Jace': ['Jace', ['Planeswalker'], ['Jace'], ['U'], null, null, ['surveil']],
  'Contract': ['Contract', ['Enchantment'], ['Aura'], ['W'], null, null, ['enchant']],
};

describe('Fichas: características', () => {
  it('toda ficha registrada está na tabela', () => {
    expect([...registry.tokens.keys()].sort()).toEqual(Object.keys(esperadas).sort());
  });
  for (const [id, [nome, tipos, subtipos, cores, p, t, kws]] of Object.entries(esperadas)) {
    it(`${id}: confere com a ficha impressa`, () => {
      const def = registry.tokens.get(id)!;
      // a ficha impressa correspondente (para a imagem) tem as mesmas características
      const o = fichasOracle.find((f) => f.oracleId === def.image);
      expect(o, `imagem da ficha ${id}`).toBeDefined();
      const face = o!.faces[0];
      expect(face.name).toBe(nome);
      expect(face.types).toEqual(tipos);
      expect(face.subtypes).toEqual(subtipos);
      expect([...face.colors].sort()).toEqual(cores);
      if (p !== null) expect([face.power, face.toughness]).toEqual([p, t]);
      expect(o!.keywords.map((k: string) => k.toLowerCase()).sort()).toEqual([...kws].sort());
      // e a ficha criada no jogo (Aura só entra presa a algo; testada pela carta que a cria)
      if (subtipos.includes('Aura')) return;
      const tg = setup({ battlefield: [[], []] });
      const [tok] = tg.run(createTokens(tg.g, 0, id, 1));
      if (p === null && tipos.includes('Creature')) return; // X/X sem valor morre como 0/0; testada pela carta que a cria
      const c = chars(tg.g, tok);
      expect(c.name).toBe(nome);
      expect(c.types).toEqual(tipos);
      expect(c.subtypes).toEqual(subtipos);
      expect([...c.colors].sort()).toEqual(cores);
      expect([c.power, c.toughness]).toEqual([p, t]);
      for (const k of kws) expect(hasKw(tg.g, tok, k), k).toBe(true);
    });
  }
});

describe('Fichas: habilidades', () => {
  it("'Treasure': {T}, sacrifique: uma mana de qualquer cor", () => {
    const tg = setup({ battlefield: [[{ name: 'Treasure', token: true }], ['Wall of Omens']], hand: [['Swords to Plowshares'], []] });
    const id = tg.bf('Treasure');
    const cores = new Set(manaOptions(tg.g, 0).filter((o) => o.obj === id).flatMap((o) => o.alt));
    expect([...cores].sort()).toEqual(['B', 'G', 'R', 'U', 'W']);
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Swords to Plowshares').resolve();
    expect(tg.find('Treasure')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
  it("'Eldrazi Spawn': sacrifique: adicione {C}", () => {
    const tg = setup({ battlefield: [[{ name: 'Eldrazi Spawn', token: true }], []], hand: [['Sol Ring'], []] });
    const id = tg.bf('Eldrazi Spawn');
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join(''))).toEqual(['C']);
    tg.cast('Sol Ring').resolve();
    expect(tg.find('Eldrazi Spawn')).toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
  it("'Pest': quando morre, você ganha 1 de vida", () => {
    const tg = setup({ battlefield: [[{ name: 'Pest', token: true }, 'Mountain', 'Mountain'], []], hand: [['Abrade'], []] });
    tg.choose('modo', ['Causa 3 de dano à criatura alvo']).choose('criatura alvo', ['Pest']).cast('Abrade').resolve();
    tg.resolveAll();
    expect(tg.life(0)).toBe(41);
  });
  it("'Pest (ataque)': sempre que ataca, você ganha 1 de vida", () => {
    const tg = setup({ battlefield: [[{ name: 'Pest (ataque)', token: true }], []] });
    tg.attack([['Pest', 1]]).passTo('declareBlockers');
    expect(tg.life(0)).toBe(41);
  });
  it("'Zombie': decaimento — não bloqueia; ao atacar, é sacrificado no fim do combate", () => {
    const tg = setup({ battlefield: [[{ name: 'Zombie', token: true }], [{ name: 'Zombie', token: true }]] });
    tg.attack([[tg.bf('Zombie', 0), 1]]).passTo('combatDamage');
    expect(tg.life(1)).toBe(38); // o Zombie de Bruno não pode bloquear
    tg.passTo('main2');
    expect(tg.all('Zombie').map((id) => tg.state.objects[id].controller)).toEqual([1]);
  });
  it("'Zombie': sem atacar, não é sacrificado", () => {
    const tg = setup({ battlefield: [[{ name: 'Zombie', token: true }], []] });
    tg.passTo('main2');
    expect(tg.find('Zombie')).not.toBeNull();
  });
  it("'Map': {1}, {T}, sacrifique: a criatura alvo que você controla explora — CR 701.44a: terreno revelado vai para a mão", () => {
    const tg = setup({ battlefield: [[{ name: 'Map', token: true }, 'Wall of Omens', 'Sol Ring'], ['Indomitable Ancients']], library: [['Forest', 'Island'], []] });
    let alvos: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura alvo que você controla')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] };
    });
    tg.activate('Map').resolve();
    expect(alvos).toEqual(['Wall of Omens']);
    expect(tg.find('Map')).toBeNull();
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.names(0, 'library')).toEqual(['Island']);
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1'] ?? 0).toBe(0);
  });
  it("'Map': CR 701.44a: carta não terreno — marcador +1/+1 e o controlador decide se ela vai para o cemitério", () => {
    for (const cemiterio of [true, false]) {
      const tg = setup({ battlefield: [[{ name: 'Map', token: true }, 'Wall of Omens', 'Sol Ring'], []], library: [['Counterspell', 'Island'], []] });
      tg.yes('Explorar: pôr Counterspell no cemitério', cemiterio);
      tg.choose('criatura alvo', ['Wall of Omens']).activate('Map').resolve();
      const wall = tg.bf('Wall of Omens');
      expect(tg.state.objects[wall].counters['+1/+1']).toBe(1);
      expect(tg.pt(wall)).toEqual([1, 5]);
      expect(tg.names(0, 'hand')).toEqual([]);
      expect(tg.names(0, 'graveyard')).toEqual(cemiterio ? ['Counterspell'] : []);
      expect(tg.names(0, 'library')).toEqual(cemiterio ? ['Island'] : ['Counterspell', 'Island']);
    }
  });
  it("'Map': com o grimório vazio, a criatura explora e recebe o marcador +1/+1", () => {
    const tg = setup({ battlefield: [[{ name: 'Map', token: true }, 'Wall of Omens', 'Sol Ring'], []], library: [[], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).activate('Map').resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1']).toBe(1);
  });
  it("'Map': ative apenas como um feitiço", () => {
    const podeAtivar = (tg: ReturnType<typeof setup>) => tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.id.startsWith('act:') && a.label.startsWith('Map:'));
    const campo = [[{ name: 'Map', token: true }, 'Wall of Omens', 'Sol Ring', 'Island'], []];
    expect(podeAtivar(setup({ battlefield: campo }))).toBe(true);
    expect(podeAtivar(setup({ battlefield: campo, step: 'beginCombat' }))).toBe(false);
    // no turno de Bruno, Ana recebe a prioridade na fase principal dele com a pilha vazia
    const outro = setup({ battlefield: campo, active: 1 }).pass();
    expect(outro.pending?.player).toBe(0);
    expect(podeAtivar(outro)).toBe(false);
    // com algo na pilha, também não
    const tg = setup({ battlefield: campo, hand: [['Brainstorm'], []], library: [['Forest', 'Forest', 'Forest'], []] });
    tg.cast('Brainstorm');
    expect(podeAtivar(tg)).toBe(false);
  });
  it("'Jace': −1: vigiar 1; só uma habilidade de lealdade por turno (CR 606.3)", () => {
    const tg = setup({ battlefield: [[{ name: 'Jace', token: true, counters: { loyalty: 4 } }], []], library: [['Island', 'Swamp'], []] });
    const jace = tg.bf('Jace');
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));
    tg.activate('Jace', '−1').resolve();
    expect(tg.state.objects[jace].counters.loyalty).toBe(3);
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
    expect(tg.actionIds().some((a) => a.startsWith(`act:${jace}:`))).toBe(false);
  });
  it("'Jace': −3: compre uma carta; com 0 de lealdade, a ficha deixa o campo (CR 704.5i)", () => {
    const tg = setup({ battlefield: [[{ name: 'Jace', token: true, counters: { loyalty: 3 } }], []], library: [['Island', 'Swamp'], []] });
    tg.activate('Jace', '−3').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.find('Jace')).toBeNull();
    // criada sem marcadores (lealdade impressa 0), também deixa o campo
    tg.run(createTokens(tg.g, 0, 'Jace', 1));
    expect(tg.find('Jace')).toBeNull();
  });
  it("'Jace': as habilidades de lealdade são só como feitiço", () => {
    const tg = setup({ active: 1, battlefield: [[{ name: 'Jace', token: true, counters: { loyalty: 4 } }], []], library: [['Island'], ['Island']] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
