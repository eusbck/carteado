import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'The Squadron Sinister';
const robo = { name: 'Robot Villain', token: true, ready: false };
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('voar e ímpeto; os outros Villains que você controla recebem +2/+2, voar e ímpeto', () => {
    const tg = setup({ battlefield: [[N, robo, 'Elvish Mystic'], [robo]] });
    const eu = tg.bf(N);
    expect(tg.pt(eu)).toEqual([5, 5]);
    expect(hasKw(tg.g, eu, 'flying') && hasKw(tg.g, eu, 'haste')).toBe(true);
    const meu = tg.bf('Robot Villain', 0);
    expect(tg.pt(meu)).toEqual([4, 4]);
    expect(hasKw(tg.g, meu, 'flying') && hasKw(tg.g, meu, 'haste')).toBe(true);
    // quem não é Villain e o Villain do oponente não recebem
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    const dele = tg.bf('Robot Villain', 1);
    expect(tg.pt(dele)).toEqual([2, 2]);
    expect(hasKw(tg.g, dele, 'flying')).toBe(false);
  });

  it('CR 702.187b: descartada neste turno, pode ser conjurada do cemitério por {3}{U}{R}', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [forests, forests] });
    expect(tg.canCast(N)).toBe(false);
    tg.run(discard(tg.g, 0, 1));
    tg.cast(N, 'mayhem').resolveAll();
    expect(tg.find(N)).not.toBeNull();
  });
});
