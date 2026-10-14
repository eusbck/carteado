import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Felix Five-Boots';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('um gatilho de "uma ou mais criaturas causam dano de combate" dispara uma vez a mais', () => {
    const tg = setup({ battlefield: [[N, 'Gonti, Canny Acquisitor'], []], library: [ilhas, ['Sol Ring', 'Prismatic Lens', ...ilhas]] });
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    tg.attack([[N, 1], ['Gonti, Canny Acquisitor', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(30);
    expect(tg.state.zones.exile.map((id) => tg.state.objects[id].def).sort()).toEqual(['Prismatic Lens', 'Sol Ring']);
  });

  it('cada disparo a mais escolhe os alvos e resolve separado', () => {
    const tg = setup({ battlefield: [[N, 'Trygon Predator'], ['Sol Ring', 'Prismatic Lens']] });
    tg.choose('artefato ou encantamento alvo', ['Sol Ring']).choose('artefato ou encantamento alvo', ['Prismatic Lens']);
    tg.yes('destruir', true).yes('destruir', true);
    tg.attack([['Trygon Predator', 1]]).passTo('main2', 0);
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Prismatic Lens')).toBeNull();
  });

  it('um gatilho de ganhar vida pelo vínculo com a vida não dispara a mais', () => {
    const tg = setup({ battlefield: [[N, 'Indulgent Aristocrat', "Ajani's Pridemate"], []] });
    tg.attack([['Indulgent Aristocrat', 1]]).passTo('main2', 0);
    expect(tg.life(0)).toBe(41);
    expect(tg.state.objects[tg.bf("Ajani's Pridemate")].counters['+1/+1']).toBe(1);
  });

  it('o dano de combate da criatura de um oponente não faz disparar a mais; o de uma sua, sim', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[N, 'Edric, Spymaster of Trest'], ['Slither Blade'], []] });
    tg.yes('Edric', true).yes('Edric', true);
    tg.attack([['Slither Blade', 2]]).passTo('main2', 1);
    expect(tg.state.zones.hand[1]).toHaveLength(1);
    tg.passTo('main1', 0);
    const antes = tg.state.zones.hand[0].length;
    tg.yes('Edric', true).yes('Edric', true);
    tg.attack([['Edric, Spymaster of Trest', 1]]).passTo('main2', 0);
    expect(tg.state.zones.hand[0].length - antes).toBe(2);
  });
});
