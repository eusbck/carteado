import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Abomination, World Ravager';
const montanhas = Array(5).fill('Mountain');
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('CR 702.187b: descartada neste turno, pode ser conjurada do cemitério por {4}{R}', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [forests, forests] });
    // com cinco Mountains o custo normal {7}{R} não é pagável
    expect(tg.canCast(N)).toBe(false);
    tg.run(discard(tg.g, 0, 1));
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    tg.cast(N, 'mayhem').resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([10, 10]);
    expect(hasKw(tg.g, id, 'menace') && hasKw(tg.g, id, 'trample')).toBe(true);
    expect(tg.all('Mountain').every((m) => tg.state.objects[m].tapped)).toBe(true);
  });

  it('no turno seguinte ao descarte, não pode mais; e que já estava no cemitério também não', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [forests, forests] });
    tg.run(discard(tg.g, 0, 1));
    expect(tg.canCast(N)).toBe(true);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.canCast(N)).toBe(false);
    const velha = setup({ battlefield: [montanhas, []], graveyard: [[N], []], library: [forests, forests] });
    expect(velha.canCast(N)).toBe(false);
  });

  it('as regras de tempo continuam valendo: descartada no turno do oponente, não pode ser conjurada', () => {
    const tg = setup({ active: 1, battlefield: [montanhas, []], hand: [[N], []], library: [forests, forests] });
    tg.run(discard(tg.g, 0, 1));
    expect(tg.canCast(N)).toBe(false);
  });
});
