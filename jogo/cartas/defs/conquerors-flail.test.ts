import { describe, expect, it } from 'vitest';
import { attach, dealDamage } from '../../motor/api.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = "Conqueror's Flail";

describe(N, () => {
  it('+1/+1 por cor entre as permanentes que você controla, só as cinco cores (no máximo +5/+5)', () => {
    // Elvish Mystic (verde) e Wall of Omens (branca); Sol Ring e os terrenos são incolores e não contam
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Wall of Omens', 'Sol Ring', 'Plains'], []] });
    attach(tg.g, tg.bf(N), tg.bf('Elvish Mystic'));
    tg.refresh();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([3, 3]);
  });

  it('enquanto equipa uma criatura, os oponentes não podem conjurar mágicas no seu turno, só no deles', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Plains', 'Plains'], ['Mountain']], hand: [[], ['Lightning Bolt']] });
    // desequipado: o oponente pode responder no seu turno
    tg.activate(N, 'Equipar');
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.canCast('Lightning Bolt')).toBe(true);
    tg.pass();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(tg.bf('Elvish Mystic'));
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.canCast('Lightning Bolt')).toBe(false);
    // no turno do oponente a proibição não vale
    tg.passTo('upkeep', 1);
    expect(tg.pending?.player).toBe(1);
    expect(tg.canCast('Lightning Bolt')).toBe(true);
  });

  it('reequipar de uma criatura para outra não abre janela para os oponentes conjurarem', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Elvish Mystic' }, 'Elvish Mystic', 'Wall of Omens', 'Plains', 'Plains'], ['Mountain']], hand: [[], ['Lightning Bolt']] });
    tg.choose('criatura alvo', ['Wall of Omens']).activate(N, 'Equipar');
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.canCast('Lightning Bolt')).toBe(false);
    tg.pass();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(tg.bf('Wall of Omens'));
  });

  it('o bônus muda com as cores e a criatura morre se o dano marcado passa a ser letal', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Elvish Mystic' }, 'Elvish Mystic', 'Wall of Omens'], ['Mountain']] });
    const elfo = tg.bf('Elvish Mystic');
    expect(tg.pt(elfo)).toEqual([3, 3]);
    dealDamage(tg.g, [{ source: tg.bf('Mountain'), target: { kind: 'obj', id: elfo }, amount: 2, combat: false }]);
    tg.refresh().settle();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    removeCard(tg, tg.bf('Wall of Omens'));
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});
