import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Stromkirk Occultist';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('atropelar; ao causar dano de combate a um jogador, exila o topo, que pode ser jogado até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], []], library: [['Sol Ring', ...forests], forests] });
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    tg.attack([[N, 1]]).passTo('main2');
    expect(tg.life(1)).toBe(37);
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    tg.cast('Sol Ring', '*').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
  });

  it('sem jogar, a carta fica exilada e a permissão acaba no fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], []], library: [['Sol Ring', ...forests], forests] });
    tg.attack([[N, 1]]).passTo('main2');
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    expect(tg.canCast('Sol Ring')).toBe(false);
  });

  it('conjurada pela loucura no turno de outro jogador, entra no campo', () => {
    const tg = setup({ active: 1, battlefield: [['Mountain', 'Mountain'], []], hand: [[N], []] });
    tg.yes('Loucura', true);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.all('Mountain').every((id) => tg.state.objects[id].tapped)).toBe(true);
    expect(tg.state.turn.active).toBe(1);
  });

  it('sem conjurar, vai para o cemitério', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [[N], []] });
    tg.yes('Loucura', false);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.find(N, 'exile')).toBeNull();
  });
});
