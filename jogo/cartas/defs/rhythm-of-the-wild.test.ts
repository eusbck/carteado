import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { counter, createTokens, destroy, hasKw } from '../../motor/api.ts';

const RW = 'Rhythm of the Wild';

describe(RW, () => {
  it('a mágica de criatura não é anulada', () => {
    const tg = setup({ battlefield: [[RW, 'Forest', 'Forest'], []], hand: [['Elvish Mystic', 'Sol Ring'], []] });
    tg.choose('Motim', ['Entrar com um marcador +1/+1']).cast('Elvish Mystic');
    expect(tg.run(counter(tg.g, tg.state.zones.stack[0]))).toBe(false);
    tg.resolve();
    tg.cast('Sol Ring');
    expect(tg.run(counter(tg.g, tg.state.zones.stack[0]))).toBe(true);
  });

  it('motim: entra com um marcador +1/+1 ou ganha ímpeto; fichas não têm motim', () => {
    const tg = setup({ battlefield: [[RW, 'Forest', 'Forest'], []], hand: [['Elvish Mystic', 'Llanowar Elves'], []] });
    tg.choose('Motim (Elvish Mystic)', ['Entrar com um marcador +1/+1']).cast('Elvish Mystic').resolve();
    const m = tg.bf('Elvish Mystic');
    expect(tg.state.objects[m].counters['+1/+1']).toBe(1);
    expect(hasKw(tg.g, m, 'haste')).toBe(false);
    tg.choose('Motim (Llanowar Elves)', ['Ganhar ímpeto']).cast('Llanowar Elves').resolve();
    const l = tg.bf('Llanowar Elves');
    expect(tg.state.objects[l].counters['+1/+1'] ?? 0).toBe(0);
    expect(hasKw(tg.g, l, 'haste')).toBe(true);
    const [ficha] = tg.run(createTokens(tg.g, 0, 'Saproling', 1));
    expect(tg.state.objects[ficha].counters['+1/+1'] ?? 0).toBe(0);
    expect(hasKw(tg.g, ficha, 'haste')).toBe(false);
  });

  it('escolhendo ímpeto, a criatura fica com ele depois de o Rhythm sair do campo', () => {
    const tg = setup({ battlefield: [[RW, 'Forest'], []], hand: [['Elvish Mystic'], []] });
    tg.choose('Motim', ['Ganhar ímpeto']).cast('Elvish Mystic').resolve();
    tg.run(destroy(tg.g, [tg.bf(RW)]));
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'haste')).toBe(true);
  });

  it('com dois Rhythm, duas escolhas', () => {
    const tg = setup({ battlefield: [[RW, RW, 'Forest'], []], hand: [['Elvish Mystic'], []] });
    tg.choose('Motim', ['Entrar com um marcador +1/+1']).choose('Motim', ['Entrar com um marcador +1/+1']).cast('Elvish Mystic').resolve();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1']).toBe(2);
  });
});
