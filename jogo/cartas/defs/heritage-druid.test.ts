import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Heritage Druid', () => {
  it('vira ela mesma e Elfos com enjoo de invocação para gerar {G}{G}{G}', () => {
    const tg = setup({ battlefield: [[{ name: 'Heritage Druid', ready: false }, { name: 'Llanowar Elves', ready: false }, { name: 'Elvish Mystic', ready: false }], []] });
    const druida = tg.bf('Heritage Druid');
    const act = tg.actionIds().find((a) => a.startsWith('mana:') && a.includes(String(druida)))!;
    expect(act).toBeDefined();
    tg.answer({ kind: 'priority', action: act });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G', 'G', 'G']);
    expect(tg.state.objects[druida].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
  });
});
