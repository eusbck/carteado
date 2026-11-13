import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Damning Verdict', () => {
  it('destrói só as criaturas sem nenhum marcador (de qualquer tipo)', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', { name: 'Llanowar Elves', counters: { '+1/+1': 1 } }, 'Arbor Elf'], [{ name: 'Elvish Mystic', counters: { '-1/-1': 0, stun: 1 } }, 'Indomitable Ancients']],
      hand: [['Damning Verdict'], []],
    });
    tg.cast('Damning Verdict').resolve();
    expect(tg.find('Llanowar Elves')).not.toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Arbor Elf')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});
