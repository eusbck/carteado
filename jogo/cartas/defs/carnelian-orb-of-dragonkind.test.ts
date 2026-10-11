import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Carnelian Orb of Dragonkind';
const L = 'Lathliss, Dragon Queen';

describe(N, () => {
  it('gasta em qualquer parte do custo de uma mágica de criatura Dragon, ela ganha ímpeto até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [[L], []] });
    tg.cast(L).resolveAll();
    const id = tg.bf(L);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(hasKw(tg.g, id, 'haste')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, id, 'haste')).toBe(false);
  });

  it('sem a mana do Orb, o Dragon não ganha ímpeto', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [[L], []] });
    // paga só com as seis Mountains
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', activate: { source: d.sources.find((s) => s.obj !== tg.bf(N))!.id } } : null));
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', activate: { source: d.sources.find((s) => s.obj !== tg.bf(N))!.id } } : null));
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', activate: { source: d.sources.find((s) => s.obj !== tg.bf(N))!.id } } : null));
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', activate: { source: d.sources.find((s) => s.obj !== tg.bf(N))!.id } } : null));
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', activate: { source: d.sources.find((s) => s.obj !== tg.bf(N))!.id } } : null));
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', activate: { source: d.sources.find((s) => s.obj !== tg.bf(N))!.id } } : null));
    tg.cast(L).resolveAll();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
    expect(hasKw(tg.g, tg.bf(L), 'haste')).toBe(false);
  });

  it('a mana pode ser gasta em qualquer coisa; fora de mágica de criatura Dragon, não dá ímpeto', () => {
    // Minion of the Mighty ({R}) é um Kobold: pode ser paga com o Orb, sem ímpeto
    const tg = setup({ battlefield: [[N], []], hand: [['Minion of the Mighty'], []] });
    tg.cast('Minion of the Mighty').resolveAll();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(hasKw(tg.g, tg.bf('Minion of the Mighty'), 'haste')).toBe(false);
    // artefato não é mágica de criatura
    const art = setup({ battlefield: [[N], []], hand: [['Sol Ring'], []] });
    art.cast('Sol Ring').resolveAll();
    expect(art.find('Sol Ring')).not.toBeNull();
  });

  it('CR 702.73a: um polimorfo é uma mágica de criatura Dragon e ganha ímpeto', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain'], []], hand: [['Taurean Mauler'], []] });
    tg.cast('Taurean Mauler').resolveAll();
    expect(hasKw(tg.g, tg.bf('Taurean Mauler'), 'haste')).toBe(true);
  });
});
