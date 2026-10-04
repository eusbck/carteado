import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ceaseless Conflict', () => {
  it('destrói todas as criaturas e cria um Espírito 3/2 por criatura não ficha sua destruída', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Sol Ring', 'Wall of Omens', 'Elvish Mystic', 'Zetalpa, Primal Dawn'], ['Indomitable Ancients']], hand: [['Ceaseless Conflict'], []] });
    tg.cast('Ceaseless Conflict').resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull(); // indestrutível não conta
    expect(tg.all('Spirit').length).toBe(2);
    expect(tg.all('Spirit').every((id) => tg.state.objects[id].controller === 0)).toBe(true);
  });
});
