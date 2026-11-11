import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Tempered Steel';

describe(N, () => {
  it('as criaturas artefato que você controla recebem +2/+2; as outras não', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true }, 'Wall of Omens'], [{ name: 'Borg', token: true }]] });
    expect(tg.pt(tg.bf('Borg', 0))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Borg', 1))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });

  it('o dano não letal fica marcado e passa a ser letal se Tempered Steel sai do campo', () => {
    const tg = setup({ battlefield: [[N, { name: 'Borg', token: true, damage: 2 }], []] });
    expect(tg.find('Borg')).not.toBeNull();
    removeCard(tg, tg.bf(N));
    tg.settle();
    expect(tg.find('Borg')).toBeNull();
  });
});
