import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaOptions } from '../../motor/costs.ts';
import { chars } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = 'Chromatic Lantern';

function cores(tg: TestGame, id: number, p = 0): string[] {
  return [...new Set(manaOptions(tg.g, p).filter((o) => o.obj === id).map((o) => o.alt.join('')))].sort();
}

describe(NOME, () => {
  it('{T}: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    expect(cores(tg, tg.bf(NOME))).toEqual(['B', 'G', 'R', 'U', 'W']);
  });
  it('CR 613.1f: os terrenos que você controla têm "{T}: Adicione uma mana de qualquer cor"; os do oponente não', () => {
    const tg = setup({ battlefield: [[NOME, 'Forest'], ['Mountain']] });
    expect(cores(tg, tg.bf('Forest', 0))).toEqual(['B', 'G', 'R', 'U', 'W']);
    expect(cores(tg, tg.bf('Mountain', 1), 1)).toEqual(['R']);
  });
  it('com a Lantern virada, duas Forests pagam {1}{W}', () => {
    const sem = setup({ battlefield: [['Forest', 'Forest'], []], hand: [['Wall of Omens'], []] });
    expect(sem.canCast('Wall of Omens')).toBe(false);
    const tg = setup({ battlefield: [[{ name: NOME, tapped: true }, 'Forest', 'Forest'], []], hand: [['Wall of Omens'], []] });
    expect(tg.canCast('Wall of Omens')).toBe(true);
    tg.cast('Wall of Omens').resolve();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
  it('os terrenos mantêm as outras habilidades e os tipos de terreno', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', 'Underground River'], []] });
    const ilha = tg.bf('Island');
    expect(chars(tg.g, ilha).subtypes).toEqual(['Island']);
    expect(chars(tg.g, ilha).abilities.map((a) => a.id)).toContain('basic:U');
    // o terreno de dor continua com {C} e com a mana colorida que causa dano
    const rio = tg.bf('Underground River');
    expect(chars(tg.g, rio).abilities.length).toBe(3);
    expect(chars(tg.g, rio).subtypes).toEqual([]);
    expect(cores(tg, rio)).toEqual(['B', 'C', 'G', 'R', 'U', 'W']);
  });
  it('quando a Lantern sai do campo, os terrenos perdem a habilidade', () => {
    const tg = setup({ battlefield: [[NOME, 'Forest'], []] });
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    expect(cores(tg, tg.bf('Forest'))).toEqual(['G']);
  });
});
