import { describe, expect, it } from 'vitest';
import { addCounters, returnToHand } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Hard-Hitting Question';

describe(N, () => {
  it('a criatura causa dano com sua força atual, sem receber dano de volta', () => {
    const tg = setup({ battlefield: [['Forest', 'Indomitable Ancients'], ['Indomitable Ancients']], hand: [[N], []] });
    const fonte = tg.bf('Indomitable Ancients', 0);
    const alvo = tg.bf('Indomitable Ancients', 1);
    tg.choose('criatura alvo que você controla', [fonte]).choose('criatura ou planeswalker alvo', [alvo]).cast(N);
    addCounters(tg.g, { kind: 'obj', id: fonte }, '+1/+1', 3, 0);
    tg.resolve();
    expect(tg.state.objects[alvo].damage).toBe(5);
    expect(tg.state.objects[fonte].damage).toBe(0);
  });

  it('o dano é da criatura, aplicando toque mortífero e vínculo com a vida', () => {
    const tg = setup({ battlefield: [['Forest', 'Vampire Nighthawk'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo que você controla', ['Vampire Nighthawk']).choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(0)).toBe(42);
    expect(tg.pt(tg.bf('Vampire Nighthawk'))).toEqual([2, 3]);
  });

  it('pode causar dano a um planeswalker que você não controla', () => {
    const tg = setup({ battlefield: [['Forest', 'Indomitable Ancients'], ['Jace, Architect of Thought']], hand: [[N], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).choose('criatura ou planeswalker alvo', ['Jace, Architect of Thought']).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Jace, Architect of Thought')].counters.loyalty).toBe(2);
  });

  it.each([0, 1])('CR 608.2b: não causa dano se o alvo %i deixar de ser legal', (jogador) => {
    const tg = setup({ battlefield: [['Forest', 'Indomitable Ancients'], ['Indomitable Ancients']], hand: [[N], []] });
    const fonte = tg.bf('Indomitable Ancients', 0);
    const alvo = tg.bf('Indomitable Ancients', 1);
    tg.choose('criatura alvo que você controla', [fonte]).choose('criatura ou planeswalker alvo', [alvo]).cast(N);
    runEffect(tg, returnToHand(tg.g, [jogador === 0 ? fonte : alvo]));
    tg.resolveAll();
    expect(tg.state.objects[jogador === 0 ? alvo : fonte].damage).toBe(0);
  });

  it('exige uma criatura sua e uma criatura ou planeswalker que você não controla', () => {
    const soMinhas = setup({ battlefield: [['Forest', 'Indomitable Ancients', 'Vampire Nighthawk'], []], hand: [[N], []] });
    expect(soMinhas.canCast(N)).toBe(false);
    const semMinha = setup({ battlefield: [['Forest'], ['Indomitable Ancients']], hand: [[N], []] });
    expect(semMinha.canCast(N)).toBe(false);
  });
});
