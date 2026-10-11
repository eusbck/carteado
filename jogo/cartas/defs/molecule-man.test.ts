import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Molecule Man';

describe(N, () => {
  it('a primeira carta comprada no turno, se não for terreno, pode ser conjurada por {0}; a segunda não', () => {
    const tg = setup({ active: 1, battlefield: [[N], []], library: [['Indomitable Ancients', 'Sol Ring', 'Island'], Array(6).fill('Island')] });
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    tg.yes('Milagre', true);
    // a compra do seu turno é a primeira
    tg.passTo('main1', 0);
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
    // a segunda carta do turno não tem milagre
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
  });

  it('vale no turno do oponente; terreno não tem milagre; é opcional', () => {
    const tg = setup({ active: 1, battlefield: [[N], []], library: [['Sol Ring', 'Island', 'Island'], Array(6).fill('Island')] });
    tg.yes('Milagre', true);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // no seu turno, a primeira compra é um terreno: nada acontece
    tg.passTo('main1', 0);
    expect(tg.names(0, 'hand')).toEqual(['Island']);

    const nao = setup({ battlefield: [[N], []], library: [['Sol Ring', 'Island'], Array(6).fill('Island')] });
    nao.yes('Milagre', false);
    runEffect(nao, draw(nao.g, 0, 1));
    nao.resolveAll();
    expect(nao.names(0, 'hand')).toEqual(['Sol Ring']);
  });
});
