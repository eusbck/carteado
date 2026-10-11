import { describe, expect, it } from 'vitest';
import { chars, nameOf } from '../../motor/chars.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fell the Profane // Fell Mire';

describe(N, () => {
  it('CR 712.11c — conjurar ou jogar olha só a face escolhida', () => {
    // frente: instantânea {2}{B}{B}, pode ser conjurada no turno do oponente
    const tg = setup({ active: 1, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    // no turno do oponente só a mágica aparece; o terreno do verso não pode ser jogado
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':hand'))).toBe(true);
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
    tg.choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N, 'hand').resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('verso: jogado como terreno, conta como a jogada de terreno; pagando 3 de vida entra desvirado', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N, 'Swamp'], []] });
    tg.yes('3 de vida', true).play(N);
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe('Fell Mire');
    expect(chars(tg.g, id).types).toEqual(['Land']);
    expect(tg.life(0)).toBe(37);
    expect(tg.state.objects[id].tapped).toBe(false);
    // já usou a jogada de terreno do turno
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
    activateMana(tg, 'Fell Mire', 'B');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['B']);
  });

  it('verso: sem pagar a vida, entra virado', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    tg.yes('3 de vida', false).play(N);
    expect(tg.life(0)).toBe(40);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
