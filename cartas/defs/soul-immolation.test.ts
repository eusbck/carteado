import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Soul Immolation', () => {
  it('blight X como custo; X de dano a cada oponente e às criaturas deles', () => {
    const tg = setup({
      players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Wall of Omens'], ['Elvish Mystic', 'Glissa Sunslayer'], []],
      hand: [['Soul Immolation'], [], []],
    });
    let maximo = -1;
    tg.script.push((d) => (d.kind === 'number' ? (maximo = d.max, { kind: 'number', value: 3 }) : null));
    tg.choose('marcador', ['Wall of Omens']);
    tg.cast('Soul Immolation').resolve();
    expect(maximo).toBe(4); // maior resistência entre as suas: Wall of Omens 0/4
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-3, 1]);
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 37, 37]);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Glissa Sunslayer')).toBeNull();
  });
  it('sem criatura, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Soul Immolation'], []] });
    expect(tg.canCast('Soul Immolation')).toBe(false);
  });
});
