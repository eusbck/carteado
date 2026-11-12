import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'The Battle of Bywater';

describe(N, () => {
  it('destrói as criaturas de força 3 ou mais e cria uma Food por criatura que você controla depois', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Savvy Hunter', 'Elvish Mystic', 'Indomitable Ancients'], ['Savvy Hunter', 'Wall of Omens']],
      hand: [[N], []],
    });
    tg.cast(N).resolveAll();
    expect(tg.all('Savvy Hunter')).toHaveLength(0);
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.all('Food')).toHaveLength(2);
  });
});
