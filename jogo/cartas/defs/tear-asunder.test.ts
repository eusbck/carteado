import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Tear Asunder';

describe(NOME, () => {
  it('reforçada, exila uma criatura; sem reforço, só artefato ou encantamento', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Sol Ring']], hand: [[NOME], []] });
    tg.choose('custo adicional opcional', ['Pagar: kicker {1}{B}']).choose('permanente não terreno alvo', ['Indomitable Ancients']).cast(NOME).resolve();
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);

    const tg2 = setup({ battlefield: [['Forest', 'Forest'], ['Indomitable Ancients', 'Sol Ring']], hand: [[NOME], []] });
    tg2.choose('custo adicional opcional', ['Não pagar']).choose('artefato ou encantamento', ['Sol Ring']).cast(NOME).resolve();
    expect(tg2.names(1, 'exile')).toEqual(['Sol Ring']);
  });

});
