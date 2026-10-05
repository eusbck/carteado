import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ominous Harvest', () => {
  it('conta todos os permanentes, de qualquer jogador, inclusive fichas; cada cópia pode ter um novo alvo', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Elvish Mystic', { name: 'Saproling', token: true }], ['Wall of Omens']],
      hand: [['Toxic Deluge', 'Ominous Harvest'], []], library: [['Island', 'Island', 'Island'], ['Island', 'Island']],
    });
    tg.number('valor de X', 1).cast('Toxic Deluge').resolve(); // Mystic e Saproling morrem
    expect(tg.find('Saproling')).toBeNull();
    tg.choose('jogador alvo', ['Ana']);
    tg.yes('novos alvos', true).choose('jogador alvo', ['Bruno']);
    tg.yes('novos alvos', false);
    tg.cast('Ominous Harvest').resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(40 - 1 - 2);
  });
});
