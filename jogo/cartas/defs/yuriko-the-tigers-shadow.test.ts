import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const YURIKO = "Yuriko, the Tiger's Shadow";
const comImposto = (n: number) => (t: ReturnType<typeof setup>) => {
  const card = t.state.players[0].commanders[0];
  if (card !== undefined) t.state.players[0].commanderCasts[String(card)] = n;
};

describe("Yuriko, the Tiger's Shadow", () => {
  it('o ninjutsu de comandante funciona da zona de comando e entra atacando quem o devolvido atacava', () => {
    const tg = setup({ players: 3, battlefield: [['Indomitable Ancients', 'Island', 'Swamp'], [], []], command: [[YURIKO], [], []] });
    tg.attack([['Indomitable Ancients', 2]]).passTo('declareBlockers');
    tg.activate(YURIKO, 'Ninjutsu de comandante').resolveAll();
    const y = tg.bf(YURIKO);
    expect(tg.state.objects[y].tapped).toBe(true);
    const atk = tg.state.combat!.attackers.find((a) => a.id === y && !a.removed)!;
    expect(atk.target).toEqual({ kind: 'player', id: 2 });
    expect(atk.blocked).toBe(false);
    expect(tg.find('Indomitable Ancients', 'hand', 0)).not.toBeNull();
    tg.passTo('main2');
    expect(tg.life(2)).toBeLessThan(40);
  });

  it('não dá para ativar antes dos bloqueios nem sem atacante não bloqueado', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Island', 'Swamp'], ['Wall of Omens']], hand: [[YURIKO], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
    tg.attack([['Indomitable Ancients', 1]]).block([['Wall of Omens', 'Indomitable Ancients']]).passTo('declareBlockers');
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });

  it('não foi declarada atacante: gatilhos de atacar não disparam', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Endless Foot Assault', 'Island', 'Swamp'], []], hand: [[YURIKO], []] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    const ninjas = tg.all('Ninja').length;
    expect(ninjas).toBe(1);
    tg.activate(YURIKO, 'Ninjutsu').resolveAll();
    expect(tg.find(YURIKO)).not.toBeNull();
    expect(tg.all('Ninja').length).toBe(1);
  });

  it('não paga nem aumenta o imposto de comandante', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Island', 'Swamp'], []], command: [[YURIKO], []], onStart: comImposto(3) });
    tg.refresh();
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    tg.activate(YURIKO, 'Ninjutsu de comandante').resolveAll();
    expect(tg.find(YURIKO)).not.toBeNull();
    expect(tg.state.players[0].commanderCasts[String(tg.state.players[0].commanders[0])]).toBe(3);
  });

  it('Ninja que causa dano de combate: revela o topo, põe na mão e cada oponente perde o valor de mana (X do custo vale 0)', () => {
    const tg = setup({
      players: 3, battlefield: [[YURIKO], [], []], library: [['Sol Ring', 'Wall of Omens'], [], []],
    });
    tg.attack([[YURIKO, 1]]).passTo('main2');
    expect(tg.find('Sol Ring', 'hand', 0)).not.toBeNull();
    // 1 de dano de combate + 1 (valor de mana de Sol Ring) para o atacado; o outro oponente perde 1
    expect(tg.life(1)).toBe(38);
    expect(tg.life(2)).toBe(39);
    // X no custo conta 0
    const tg2 = setup({ battlefield: [[YURIKO], []], library: [['Comet Storm'], []] });
    tg2.attack([[YURIKO, 1]]).passTo('main2');
    expect(tg2.life(1)).toBe(40 - 1 - 2);
  });
});
