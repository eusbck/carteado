import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const sete = Array(7).fill('Plains');

describe('Emeria, the Sky Ruin', () => {
  it('{T}: adiciona {W} e entra virado', () => {
    expect(alternativasDeMana('Emeria, the Sky Ruin')).toEqual(['W']);
    expect(entraVirado('Emeria, the Sky Ruin')).toBe(true);
  });
  it('com sete Plains, devolve uma criatura do cemitério na manutenção', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Emeria, the Sky Ruin', ...sete], []], graveyard: [['Wall of Omens'], []], library: [['Island'], ['Island']] });
    tg.yes('Devolver', true);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
    tg.resolve();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
  it('CR 603.4: com menos de sete Plains não dispara', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Emeria, the Sky Ruin', ...sete.slice(1)], []], graveyard: [['Wall of Omens'], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
