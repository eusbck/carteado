import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Rite of Replication', () => {
  it('sem kicker, uma ficha', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], ['Gau, Feral Youth']], hand: [['Rite of Replication'], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('criatura alvo', ['Gau, Feral Youth']);
    tg.cast('Rite of Replication').resolve();
    expect(tg.all('Gau, Feral Youth').length).toBe(2);
  });
  it('com kicker, cinco fichas', () => {
    const tg = setup({ battlefield: [[...Array(9).fill('Island')], ['Elvish Mystic']], hand: [['Rite of Replication'], []] });
    tg.choose('custo adicional opcional', ['Pagar: kicker {5}']).choose('criatura alvo', ['Elvish Mystic']);
    tg.cast('Rite of Replication').resolve();
    expect(tg.all('Elvish Mystic').filter((id) => tg.state.objects[id].controller === 0).length).toBe(5);
  });
});
