import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ifnir Deadlands', () => {
  it('pode sacrificar a si mesma para pagar o custo', () => {
    const tg = setup({ battlefield: [['Ifnir Deadlands', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Wall of Omens']] });
    tg.choose('criatura alvo que um oponente', ['Wall of Omens']).choose('Desert', ['Ifnir Deadlands']);
    tg.activate('Ifnir Deadlands', 'marcadores').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-2, 2]);
    expect(tg.names(0, 'graveyard')).toEqual(['Ifnir Deadlands']);
  });
});
