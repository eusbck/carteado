import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Contagion Clasp', () => {
  it('ao entrar, -1/-1 na criatura alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Indomitable Ancients']], hand: [['Contagion Clasp'], []] });
    tg.cast('Contagion Clasp').resolve().resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([1, 9]);
  });
  it('escolhe permanentes e jogadores de qualquer um, só no campo; pode não escolher todos; cada escolhido ganha um de cada tipo que já tem', () => {
    const tg = setup({
      battlefield: [['Contagion Clasp', 'Plains', 'Plains', 'Plains', 'Plains', { name: 'Quintorius, History Chaser', counters: { loyalty: 3, '+1/+1': 1 } }],
        [{ name: 'Indomitable Ancients', counters: { '-1/-1': 2 } }, { name: 'Wall of Omens', counters: { '+1/+1': 1 } }]],
    });
    tg.state.players[1].counters.poison = 3;
    tg.choose('Proliferar', ['Quintorius, History Chaser', 'Indomitable Ancients', 'Bruno']);
    tg.activate('Contagion Clasp', 'Prolifere').resolve();
    const q = tg.state.objects[tg.bf('Quintorius, History Chaser')].counters;
    expect([q.loyalty, q['+1/+1']]).toEqual([4, 2]);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['-1/-1']).toBe(3);
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1']).toBe(1);
    expect(tg.state.players[1].counters.poison).toBe(4);
  });
});
