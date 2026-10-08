import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife } from '../../motor/api.ts';

describe('Pest Rescuer', () => {
  it('na manutenção de cada jogador, cria um Pest se você não tem um', () => {
    const tg = setup({ step: 'end', battlefield: [['Pest Rescuer'], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.all('Pest').length).toBe(1);
  });
  it('CR 603.4: com uma ficha Pest, não dispara', () => {
    const tg = setup({ step: 'end', battlefield: [['Pest Rescuer', { name: 'Pest', token: true }], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep');
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('ganho "para cada" é um evento só: +1 uma vez; dois Pest Rescuers somam +2', () => {
    const tg = setup({ battlefield: [['Pest Rescuer'], ['Pest Rescuer']] });
    gainLife(tg.g, 0, 3, null);
    expect(tg.life(0)).toBe(44);
    const tg2 = setup({ battlefield: [['Pest Rescuer', 'Pest Rescuer'], []] });
    gainLife(tg2.g, 0, 3, null);
    expect(tg2.life(0)).toBe(45);
  });
});
