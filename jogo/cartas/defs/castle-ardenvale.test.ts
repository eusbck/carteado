import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Castle Ardenvale';

describe(NOME, () => {
  it('CR 605: produz {W}', () => expect(alternativasDeMana(NOME)).toEqual(['W']));
  it('CR 614.1c: entra virado sem Plains; desvirado com uma', () => {
    expect(entraVirado(NOME)).toBe(true);
    expect(entraVirado(NOME, ['Plains'])).toBe(false);
  });
  it('{2}{W}{W}, {T}: cria uma ficha Human branca 1/1', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Plains', 'Plains', 'Plains'], []] });
    tg.activate(NOME, 'Human').resolve();
    const h = tg.bf('Human');
    expect(tg.pt(h)).toEqual([1, 1]);
    expect(tg.state.objects[h].isToken).toBe(true);
  });
});
