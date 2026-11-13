import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/actions.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Badgermole Cub';

describe(N, () => {
  it('dobra a terra: a Planície vira criatura 1/1 com ímpeto e continua Planície', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Plains'], []], hand: [[N], []] });
    const planicie = tg.bf('Plains');
    tg.choose('terreno alvo que você controla', [planicie]).cast(N).resolve();
    tg.resolveAll();
    const c = chars(tg.g, planicie);
    expect(c.types).toEqual(expect.arrayContaining(['Land', 'Creature']));
    expect(c.subtypes).toContain('Plains');
    expect(tg.pt(planicie)).toEqual([1, 1]);
    expect(hasKw(tg.g, planicie, 'haste')).toBe(true);
  });
  it('quando o terreno dobrado morre, volta ao campo virado', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Plains'], []], hand: [[N], []] });
    tg.choose('terreno alvo que você controla', [tg.bf('Plains')]).cast(N).resolve();
    tg.resolveAll();
    runEffect(tg, destroy(tg.g, [tg.bf('Plains')]));
    tg.resolveAll();
    const volta = tg.bf('Plains');
    expect(tg.state.objects[volta].tapped).toBe(true);
    expect(chars(tg.g, volta).types).not.toContain('Creature');
  });
  it('virar uma criatura para mana gera {G} a mais; terreno não', () => {
    const tg = setup({ battlefield: [[N, 'Llanowar Elves', 'Forest'], []] });
    const elfo = tg.bf('Llanowar Elves');
    tg.answer({ kind: 'priority', action: tg.actionIds().find((a) => a.startsWith('mana:') && a.includes(String(elfo)))! });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G', 'G']);
    tg.answer({ kind: 'priority', action: tg.actionIds().find((a) => a.startsWith('mana:') && a.includes(String(tg.bf('Forest'))))! });
    tg.settle();
    expect(tg.state.players[0].manaPool.length).toBe(3);
  });
});
