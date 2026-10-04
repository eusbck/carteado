import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Pawn of Ulamog', () => {
  it('cada Pawn dispara para cada criatura; fichas que morrem não contam', () => {
    const tg = setup({ battlefield: [['Pawn of Ulamog', 'Pawn of Ulamog', 'Elvish Mystic', { name: 'Saproling', token: true }, 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Infernal Grasp', 'Infernal Grasp'], []] });
    tg.yes('Eldrazi Spawn', true);
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Infernal Grasp').resolve().resolveAll();
    expect(tg.all('Eldrazi Spawn').length).toBe(2);
    tg.choose('criatura alvo', ['Saproling']).cast('Infernal Grasp').resolve();
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('CR 603.10a: várias criaturas (inclusive o Pawn) morrendo juntas disparam uma vez cada', () => {
    const tg = setup({ battlefield: [['Pawn of Ulamog', 'Elvish Mystic', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Toxic Deluge'], []] });
    tg.yes('Eldrazi Spawn', true);
    tg.number('valor de X', 2).cast('Toxic Deluge').resolve().resolveAll();
    expect(tg.all('Eldrazi Spawn').length).toBe(2);
  });
});
