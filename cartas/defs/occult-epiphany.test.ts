import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const ilhas = ['Island', 'Island', 'Island', 'Island'];

describe('Occult Epiphany', () => {
  it('conta os tipos de carta (artefato e criatura contam dois), não supertipos nem subtipos', () => {
    const tg = setup({
      battlefield: [ilhas, []], hand: [['Occult Epiphany', 'Crashing Drawbridge', 'Plains'], []],
      library: [['Forest', 'Sol Ring', 'Swamp', 'Mountain'], []],
    });
    tg.number('valor de X', 3).choose('Descarte 3 cartas', ['Crashing Drawbridge', 'Plains', 'Forest']);
    tg.cast('Occult Epiphany').resolve();
    // comprou três; descartou um artefato criatura e dois terrenos básicos: artefato, criatura, terreno
    expect(tg.names(0, 'hand').sort()).toEqual(['Sol Ring', 'Swamp']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Crashing Drawbridge', 'Forest', 'Occult Epiphany', 'Plains']);
    const espiritos = tg.all('Spirit');
    expect(espiritos.length).toBe(3);
    expect(tg.pt(espiritos[0])).toEqual([1, 1]);
    expect(hasKw(tg.g, espiritos[0], 'flying')).toBe(true);
  });

  it('dois terrenos descartados dão uma ficha só', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [['Occult Epiphany', 'Plains', 'Sol Ring'], []], library: [['Forest', 'Swamp'], []] });
    tg.number('valor de X', 2).choose('Descarte 2 cartas', ['Plains', 'Forest']);
    tg.cast('Occult Epiphany').resolve();
    expect(tg.all('Spirit').length).toBe(1);
    expect(tg.names(0, 'hand').sort()).toEqual(['Sol Ring', 'Swamp']);
  });

  it('com X = 0, não compra, não descarta e não cria nada', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Occult Epiphany', 'Plains'], []], library: [['Forest'], []] });
    tg.number('valor de X', 0).cast('Occult Epiphany').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.all('Spirit').length).toBe(0);
  });
});
