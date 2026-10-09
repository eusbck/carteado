// A última informação conhecida (LKI, CR 608.2h) não muda depois de gravada: com CONGELAR_LKI=1 as entradas ficam
// congeladas (a suíte inteira roda assim para provar que nenhum código as muda).
import { describe, expect, it } from 'vitest';
import { CONGELAR_LKI } from '../motor/state.ts';
import { setup } from './harness.ts';

describe('LKI', () => {
  it.runIf(CONGELAR_LKI)('com CONGELAR_LKI=1, a entrada gravada e as das cópias do estado ficam congeladas', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring');
    const lki = Object.values(tg.state.lki);
    expect(lki.length).toBeGreaterThan(0);
    for (const e of lki) {
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.obj)).toBe(true);
      expect(Object.isFrozen(e.chars.abilities)).toBe(true);
      expect(() => { (e.obj as { tapped: boolean }).tapped = true; }).toThrow(TypeError);
    }
    const cp = tg.game.checkpoint()!;
    for (const e of Object.values(cp.state.lki)) expect(Object.isFrozen(e)).toBe(true);
  });
});
