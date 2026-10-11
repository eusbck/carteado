import { describe, expect, it } from 'vitest';
import { hasKw, hooks } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Thundermane Dragon';
const L = 'Lathliss, Dragon Queen';
const montanhas = Array(6).fill('Mountain');
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('você pode olhar o topo do seu grimório a qualquer momento; o oponente não', () => {
    const tg = setup({ battlefield: [[N], []], library: [forests, forests] });
    const pode = (p: number) => hooks(tg.g, 'lookAtTopOfLibrary').some((h) => h.fn(h.ctx, p));
    expect(pode(0)).toBe(true);
    expect(pode(1)).toBe(false);
  });

  it('conjura do topo uma criatura com força 4 ou mais, na fase principal com a pilha vazia, e ela ganha ímpeto até o fim do turno', () => {
    // no turno do oponente e na sua manutenção não é hora de conjurar uma criatura
    const fora = setup({ active: 1, battlefield: [[N, ...montanhas], []], library: [[L, ...forests], forests] });
    expect(fora.canCast(L)).toBe(false);
    fora.passTo('upkeep', 0);
    expect(fora.canCast(L)).toBe(false);

    const tg = setup({ battlefield: [[N, ...montanhas], []], library: [[L, ...forests], forests] });
    expect(tg.canCast(L)).toBe(true);
    tg.cast(L, '*').resolveAll();
    const id = tg.bf(L);
    // saiu do grimório e o custo foi pago
    expect(tg.state.zones.library[0]).toHaveLength(10);
    expect(tg.all('Mountain').every((m) => tg.state.objects[m].tapped)).toBe(true);
    expect(hasKw(tg.g, id, 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, id, 'haste')).toBe(false);
  });

  it('criatura com força menor que 4, carta que não é criatura e o topo do oponente não podem ser conjurados assim', () => {
    const fraca = setup({ battlefield: [[N, ...montanhas, 'Forest'], []], library: [['Elvish Mystic', ...forests], forests] });
    expect(fraca.canCast('Elvish Mystic')).toBe(false);
    const artefato = setup({ battlefield: [[N, ...montanhas], []], library: [['Sol Ring', ...forests], forests] });
    expect(artefato.canCast('Sol Ring')).toBe(false);
    const dele = setup({ active: 1, battlefield: [[N], montanhas], library: [forests, [L, ...forests]] });
    expect(dele.canCast(L)).toBe(false);
  });

  it('conjurada da mão, a criatura não ganha ímpeto', () => {
    const tg = setup({ battlefield: [[N, ...montanhas], []], hand: [[L], []], library: [forests, forests] });
    tg.cast(L).resolveAll();
    expect(hasKw(tg.g, tg.bf(L), 'haste')).toBe(false);
  });
});
