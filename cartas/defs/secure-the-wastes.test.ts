import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe('Secure the Wastes', () => {
  it('cria X fichas de criatura Warrior 1/1 brancas, inclusive no turno do oponente', () => {
    const tg = setup({ active: 1, battlefield: [['Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Secure the Wastes'], []] });
    tg.pass(); // Bruno passa; Ana conjura a instantânea no turno dele
    tg.number('valor de X', 3).cast('Secure the Wastes').resolve();
    const fichas = tg.all('Warrior');
    expect(fichas.length).toBe(3);
    expect(tg.pt(fichas[0])).toEqual([1, 1]);
    expect(chars(tg.g, fichas[0]).colors).toEqual(['W']);
    expect(fichas.every((id) => tg.state.objects[id].controller === 0)).toBe(true);
  });

  it('com X = 0, não cria nada', () => {
    const tg = setup({ battlefield: [['Plains'], []], hand: [['Secure the Wastes'], []] });
    tg.number('valor de X', 0).cast('Secure the Wastes').resolve();
    expect(tg.all('Warrior').length).toBe(0);
    expect(tg.names(0, 'graveyard')).toEqual(['Secure the Wastes']);
  });
});
