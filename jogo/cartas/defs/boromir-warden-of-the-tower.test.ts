import { describe, expect, it } from 'vitest';
import { hasKw, ringTemptations } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Boromir, Warden of the Tower';

describe(N, () => {
  it('mágica conjurada com mana não é anulada; sem mana nenhuma, é', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island']], hand: [[], ['Lotus Petal', 'Sol Ring']] });
    expect(hasKw(tg.g, tg.bf(N), 'vigilance')).toBe(true);
    tg.cast('Lotus Petal').resolveAll();
    expect(tg.find('Lotus Petal')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Lotus Petal']);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('as suas mágicas sem mana não são anuladas', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Lotus Petal'], []] });
    tg.cast('Lotus Petal').resolveAll();
    expect(tg.find('Lotus Petal')).not.toBeNull();
  });

  it('sacrifique Boromir: as suas criaturas ganham indestrutível até o fim do turno e o Anel tenta você', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Wall of Omens']] });
    tg.activate(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    const elfo = tg.bf('Elvish Mystic');
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'indestructible')).toBe(false);
    expect(ringTemptations(tg.g, 0)).toBe(1);
    tg.passTo('main1', 1);
    expect(hasKw(tg.g, elfo, 'indestructible')).toBe(false);
  });
});
