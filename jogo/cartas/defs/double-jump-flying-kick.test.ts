import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Double Jump // Flying Kick';
const terrenos = ['Island', 'Island', 'Mountain', 'Mountain'];

describe(N, () => {
  it('Double Jump: marcador de voar e força e resistência base 5/5 até o fim do turno', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Elvish Mystic'], []], hand: [[N], []] });
    tg.choose('que você controla', ['Elvish Mystic']).cast(N, 'hand').resolveAll();
    const id = tg.bf('Elvish Mystic');
    expect(tg.state.objects[id].counters.flying).toBe(1);
    expect(tg.pt(id)).toEqual([5, 5]);
    tg.passTo('upkeep', 1);
    // o 5/5 acaba; o marcador de voar fica
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(tg.state.objects[id].counters.flying).toBe(1);
  });

  it('Flying Kick: a sua criatura causa dano igual à força dela à criatura do oponente', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Indomitable Ancients'], ['Wall of Omens']], hand: [[N], []] });
    tg.choose('que você controla', ['Indomitable Ancients']).choose('que um oponente controla', ['Wall of Omens']);
    tg.cast(N, 'hand@1').resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(2);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
  });

  it('CR 702.102: fundida da mão, paga os dois custos e as metades resolvem em ordem (5/5 e depois 5 de dano)', () => {
    const tg = setup({ battlefield: [[...terrenos, 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('que você controla', ['Elvish Mystic']).choose('que você controla', ['Elvish Mystic']).choose('que um oponente controla', ['Indomitable Ancients']);
    tg.cast(N, 'fuse');
    // na pilha, a mágica fundida tem as duas metades: valor de mana 4, azul e vermelha
    const magica = tg.state.zones.stack[0];
    expect(chars(tg.g, magica).manaValue).toBe(4);
    expect([...chars(tg.g, magica).colors].sort()).toEqual(['R', 'U']);
    tg.resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([5, 5]);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(5);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(4);
  });

  it('CR 709.4: fora da pilha a carta tem as duas metades; a fusão só existe da mão', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []] });
    const id = tg.find(N, 'hand', 0)!;
    expect(chars(tg.g, id).manaValue).toBe(4);
    const chaves = tg.actionIds().filter((a) => a.startsWith('cast:')).map((a) => a.split(':').slice(2).join(':')).sort();
    // sem criatura sua para ser alvo, nenhuma metade pode ser conjurada
    expect(chaves).toEqual([]);
    const com = setup({ battlefield: [[...terrenos, 'Elvish Mystic'], ['Wall of Omens']], hand: [[N], []] });
    const chaves2 = com.actionIds().filter((a) => a.startsWith('cast:')).map((a) => a.split(':').slice(2).join(':')).sort();
    expect(chaves2).toEqual(['fuse', 'hand', 'hand@1']);
  });
});
