import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Aurelia, the Warleader', () => {
  it('a fase de combate adicional vem logo depois, sem fase principal; só dispara no primeiro ataque do turno', () => {
    const tg = setup({ battlefield: [['Aurelia, the Warleader', 'Indomitable Ancients'], []], library: [[], ['Island']] });
    const passos: string[] = [];
    tg.attack([['Aurelia, the Warleader', 1], ['Indomitable Ancients', 1]]);
    tg.attack([['Aurelia, the Warleader', 1], ['Indomitable Ancients', 1]]);
    tg.passUntil((x) => x.state.turn.step === 'declareBlockers');
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(false); // desvirada pelo gatilho
    tg.passUntil((x) => { passos.push(x.state.turn.step); return x.state.turn.step === 'main2'; });
    // entre os dois combates não houve fase principal; o segundo ataque não dispara de novo
    expect(passos.lastIndexOf('declareBlockers')).toBeGreaterThan(passos.indexOf('endCombat'));
    expect(passos.indexOf('main2')).toBe(passos.length - 1);
    expect(tg.state.turn.combatCount).toBe(2);
    expect(tg.life(1)).toBe(40 - 5 - 5);
  });
});
