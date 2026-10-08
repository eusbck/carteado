import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Chimil, the Inner Sun', () => {
  it('a mágica que anula ainda pode mirar, mas não anula', () => {
    const tg = setup({ battlefield: [['Chimil, the Inner Sun', 'Swamp', 'Swamp'], ['Island', 'Island']], hand: [["Night's Whisper"], ['Counterspell']], library: [['Plains', 'Plains'], []] });
    tg.cast("Night's Whisper").pass();
    tg.choose('mágica alvo', ["Night's Whisper"]).cast('Counterspell').resolveAll();
    expect(tg.names(0, 'hand').length).toBe(2);
  });
  it('descobrir 5 na etapa final: conjura de graça ou põe na mão', () => {
    const tg = setup({ battlefield: [['Chimil, the Inner Sun'], []], library: [['Forest', 'Zetalpa, Primal Dawn', 'Wall of Omens', 'Island'], []] });
    tg.yes('Descobrir', true);
    tg.passTo('end').resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    // as exiladas (terreno e a de valor alto) vão para o fundo
    expect(tg.names(0, 'library').slice(-2).sort()).toEqual(['Forest', 'Zetalpa, Primal Dawn']);
  });
});
