import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const N = 'Soaring Seacliff';

describe(N, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(N)).toEqual(['U']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(N)).toBe(true));
  it('ao entrar, a criatura alvo ganha voar até o fim do turno', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients'], []], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).play(N).resolve();
    const id = tg.bf('Indomitable Ancients');
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.passTo('main1', 1);
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
  });
});
