import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Beledros Witherbloom', () => {
  it('cria um Pest no início de cada manutenção', () => {
    const tg = setup({ step: 'end', battlefield: [['Beledros Witherbloom'], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.all('Pest').length).toBe(1);
  });
  it('pague 10 de vida: desvira seus terrenos, uma vez por turno', () => {
    const virado = (name: string) => ({ name, tapped: true });
    const tg = setup({ battlefield: [['Beledros Witherbloom', virado('Swamp'), virado('Forest'), 'Wall of Omens'], [virado('Island')]] });
    tg.activate('Beledros Witherbloom').resolve();
    expect(tg.life(0)).toBe(30);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.pending!.kind === 'priority' && tg.pending!.actions.some((a) => a.id.startsWith('act:') && a.obj === tg.bf('Beledros Witherbloom'))).toBe(false);
  });
});
