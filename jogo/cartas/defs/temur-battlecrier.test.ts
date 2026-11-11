import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Temur Battlecrier', () => {
  it('no seu turno, as mágicas custam {1} a menos por criatura sua com força 4 ou mais (ela mesma conta)', () => {
    // Battlecrier (4/3) e Zetalpa (4/8): Indomitable Ancients ({2}{W}{W}) por {W}{W}
    const tg = setup({ battlefield: [['Temur Battlecrier', 'Zetalpa, Primal Dawn', 'Plains', 'Plains'], []], hand: [['Indomitable Ancients'], []] });
    expect(tg.canCast('Indomitable Ancients')).toBe(true);
    const so = setup({ battlefield: [['Temur Battlecrier', 'Plains', 'Plains'], []], hand: [['Indomitable Ancients'], []] });
    expect(so.canCast('Indomitable Ancients')).toBe(false);
  });
  it('fora do seu turno, não reduz', () => {
    // Fact or Fiction ({3}{U}), instantânea: com Battlecrier e Zetalpa, {1}{U} bastam no seu turno, mas não no do oponente
    const meu = setup({ battlefield: [['Temur Battlecrier', 'Zetalpa, Primal Dawn', 'Island', 'Island'], []], hand: [['Fact or Fiction'], []] });
    expect(meu.canCast('Fact or Fiction')).toBe(true);
    const tg = setup({ battlefield: [['Temur Battlecrier', 'Zetalpa, Primal Dawn', 'Island', 'Island'], []], hand: [['Fact or Fiction'], []], active: 1 });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.canCast('Fact or Fiction')).toBe(false);
  });
});
