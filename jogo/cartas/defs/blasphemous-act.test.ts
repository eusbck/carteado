import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Blasphemous Act', () => {
  it('custa {1} a menos por criatura e causa 13 a cada uma', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Wall of Omens'], ['Zetalpa, Primal Dawn', 'Indomitable Ancients']], hand: [['Blasphemous Act'], []] });
    tg.cast('Blasphemous Act').resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].damage).toBe(13); // indestrutível
  });
  it('a redução não tira o {R}', () => {
    const muitas = Array(12).fill('Wall of Omens');
    const tg = setup({ battlefield: [['Plains', ...muitas], []], hand: [['Blasphemous Act'], []] });
    expect(tg.canCast('Blasphemous Act')).toBe(false);
    const tg2 = setup({ battlefield: [['Mountain', ...muitas], []], hand: [['Blasphemous Act'], []] });
    expect(tg2.canCast('Blasphemous Act')).toBe(true);
  });
});
