import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Squee, the Immortal';
const montanhas = ['Mountain', 'Mountain', 'Mountain'];
const forests = Array(6).fill('Forest');

describe(N, () => {
  it('da mão é conjurado normalmente', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
  });

  it('do cemitério e do exílio, pagando o custo e só no tempo de uma criatura', () => {
    const cem = setup({ battlefield: [montanhas, []], graveyard: [[N], []] });
    cem.cast(N, '*').resolveAll();
    expect(cem.find(N)).not.toBeNull();
    expect(cem.all('Mountain').every((id) => cem.state.objects[id].tapped)).toBe(true);

    const ex = setup({ battlefield: [montanhas, []], exile: [[N], []] });
    ex.cast(N, '*').resolveAll();
    expect(ex.find(N)).not.toBeNull();

    // sem mana, ou no turno do oponente, não pode
    const semMana = setup({ battlefield: [['Mountain'], []], graveyard: [[N], []] });
    expect(semMana.canCast(N)).toBe(false);
    const fora = setup({ active: 1, battlefield: [montanhas, []], graveyard: [[N], []], library: [forests, forests] });
    fora.pass();
    expect(fora.pending?.player).toBe(0);
    expect(fora.canCast(N)).toBe(false);
  });

  it('o oponente não pode conjurar o seu Squee', () => {
    const tg = setup({ active: 1, battlefield: [[], montanhas], graveyard: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });
});
