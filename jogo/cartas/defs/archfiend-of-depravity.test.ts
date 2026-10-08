import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Archfiend of Depravity', () => {
  it('o oponente escolhe na resolução as que ficam', () => {
    const tg = setup({ active: 1, battlefield: [['Archfiend of Depravity', 'Elvish Mystic'], ['Wall of Omens', 'Elvish Mystic', 'Indomitable Ancients']] });
    tg.choose('Archfiend of Depravity', ['Wall of Omens', 'Indomitable Ancients']);
    tg.passTo('end').resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull(); // só no turno do oponente
  });
  it('sem escolher nenhuma, sacrifica todas', () => {
    const tg = setup({ active: 1, battlefield: [['Archfiend of Depravity'], ['Wall of Omens', 'Elvish Mystic', 'Indomitable Ancients']] });
    tg.choose('Archfiend of Depravity', []);
    tg.passTo('end').resolve();
    expect(tg.names(1, 'graveyard').length).toBe(3);
  });
  it('não dispara no seu próprio turno', () => {
    const tg = setup({ battlefield: [['Archfiend of Depravity', 'Elvish Mystic', 'Wall of Omens', 'Sylvan Caryatid'], []] });
    tg.passTo('end');
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
