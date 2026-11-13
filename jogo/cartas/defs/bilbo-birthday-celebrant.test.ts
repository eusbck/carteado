import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Bilbo, Birthday Celebrant';
const lands = ['Plains', 'Swamp', 'Forest', 'Forest', 'Forest'];

describe(N, () => {
  it('ganhar vida uma vez dá 1 a mais, qualquer que seja a quantidade', () => {
    const tg = setup({ battlefield: [[N], []] });
    gainLife(tg.g, 0, 3, null);
    expect(tg.life(0)).toBe(44);
    gainLife(tg.g, 1, 3, null);
    expect(tg.life(1)).toBe(43);
  });

  it('com 111 ou mais de vida: exile Bilbo e ponha quantas criaturas quiser do grimório no campo', () => {
    const tg = setup({ life: 111, battlefield: [[N, ...lands], []], library: [['Forest', 'Elvish Mystic', 'Wall of Omens', 'Forest'], []] });
    tg.choose('Procure quantas', ['Elvish Mystic', 'Wall of Omens']).activate(N).resolveAll();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.names(0, 'library').every((n) => n === 'Forest')).toBe(true);
  });

  it('com menos de 111 de vida não pode ativar', () => {
    const tg = setup({ life: 110, battlefield: [[N, ...lands], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act') && a.includes(String(tg.bf(N))))).toBe(false);
  });
});
