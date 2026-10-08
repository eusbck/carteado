import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

const ilhas = (n: number) => Array(n).fill('Island');

describe('Shark Typhoon', () => {
  it('mágica que não é de criatura cria um Shark X/X azul com voar, X = valor de mana; mágica de criatura não', () => {
    const tg = setup({ battlefield: [['Shark Typhoon', 'Forest', 'Forest'], []], hand: [['Sol Ring', 'Elvish Mystic'], []] });
    tg.cast('Sol Ring').resolveAll();
    const shark = tg.bf('Shark');
    expect(tg.pt(shark)).toEqual([1, 1]);
    expect(chars(tg.g, shark).colors).toEqual(['U']);
    expect(hasKw(tg.g, shark, 'flying')).toBe(true);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.all('Shark').length).toBe(1);
  });

  it('o X de uma mágica com {X} no custo entra no valor de mana', () => {
    const tg = setup({ battlefield: [['Shark Typhoon', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Secure the Wastes'], []] });
    tg.number('valor de X', 3).cast('Secure the Wastes').resolveAll();
    expect(tg.pt(tg.bf('Shark'))).toEqual([4, 4]);
    expect(tg.all('Warrior').length).toBe(3);
  });

  it('o gatilho resolve antes da mágica e mesmo que ela seja anulada', () => {
    const tg = setup({ battlefield: [['Shark Typhoon', 'Forest'], ['Island', 'Island']], hand: [['Sol Ring'], ['Counterspell']] });
    tg.cast('Sol Ring').pass();
    tg.choose('mágica alvo', ['Sol Ring']).cast('Counterspell').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Sol Ring']);
    tg.resolveAll();
    expect(tg.pt(tg.bf('Shark'))).toEqual([1, 1]);
  });

  it('ciclar: o gatilho cria o Shark X/X antes de comprar a carta', () => {
    const tg = setup({ battlefield: [ilhas(4), []], hand: [['Shark Typhoon'], []], library: [['Swamp'], []] });
    tg.number('valor de X', 2).activate('Shark Typhoon', 'Ciclagem');
    expect(tg.names(0, 'graveyard')).toEqual(['Shark Typhoon']);
    // a ciclagem embaixo, o gatilho de ciclar em cima
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.pt(tg.bf('Shark'))).toEqual([2, 2]);
    expect(tg.names(0, 'hand')).toEqual([]);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
    // pagou {2}{1}{U}
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Island' && tg.state.objects[id].tapped).length).toBe(4);
  });

  it('ciclar com X = 0 cria um Shark 0/0, que morre', () => {
    const tg = setup({ battlefield: [ilhas(2), []], hand: [['Shark Typhoon'], []], library: [['Swamp'], []] });
    tg.number('valor de X', 0).activate('Shark Typhoon', 'Ciclagem').resolveAll();
    expect(tg.find('Shark')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
  });

  it('no campo, não dá para ciclar; ciclar outra carta não dispara o gatilho de ciclar', () => {
    const tg = setup({ battlefield: [[...ilhas(3), 'Shark Typhoon'], []], hand: [['Canyon Slough'], []], library: [['Swamp', 'Island'], []] });
    expect(tg.actionIds().filter((a) => a.startsWith('act:')).map((a) => tg.state.objects[Number(a.split(':')[1])].def)).toEqual(['Canyon Slough']);
    tg.activate('Canyon Slough', 'Ciclagem').resolveAll();
    expect(tg.find('Shark')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
  });
});
