import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Minuta do Golpe';
const lib = Array(12).fill('Island');

describe(N, () => {
  it('I destrói uma criatura; II destrói as de poder 2 ou menos; III cobra uma criatura e 3 de vida de quem conjurou', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Zetalpa, Primal Dawn'], ['Indomitable Ancients', 'Elvish Mystic', 'Serra Angel']],
      hand: [[N], []], library: [lib, lib],
    });
    tg.choose('criatura alvo', ['Serra Angel']);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Serra Angel']);
    // capítulo II no seu próximo turno
    tg.passTo('main1', 1).passTo('main1', 0);
    tg.resolveAll();
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Elvish Mystic', 'Indomitable Ancients', 'Serra Angel']);
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    // capítulo III no turno seguinte
    tg.passTo('main1', 1).passTo('main1', 0);
    tg.resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).toBeNull();
    expect(tg.life(0)).toBe(37);
    expect(tg.find(N)).toBeNull();
  });
});
