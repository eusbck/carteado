// Exaurir / exert (CR 701.43) e rolar um dado (CR 706), motor/mecanicas-ur.ts.
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { exert, rollDie } from '../motor/api.ts';

describe('Exaurir (CR 701.43)', () => {
  it('CR 701.43a: o permanente exaurido não desvira na próxima etapa de desvirar do controlador; depois, sim', () => {
    const tg = setup({ battlefield: [[{ name: 'Sol Ring', tapped: true }], []], library: [Array(4).fill('Island'), Array(4).fill('Island')] });
    const id = tg.bf('Sol Ring');
    expect(exert(tg.g, id)).toBe(true);
    // CR 701.43b: exaurir de novo não acumula
    exert(tg.g, id);
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(tg.state.objects[id].tapped).toBe(true);
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(tg.state.objects[id].tapped).toBe(false);
  });
  it('CR 701.43c: fora do campo, não se exaure', () => {
    const tg = setup({ hand: [['Sol Ring'], []] });
    expect(exert(tg.g, tg.find('Sol Ring', 'hand')!)).toBe(false);
  });
});

describe('Rolar um dado (CR 706)', () => {
  it('CR 706.1a: um d20 dá de 1 a 20, com o gerador da partida (reproduzível)', () => {
    const a = setup({ seed: 'dado' });
    const b = setup({ seed: 'dado' });
    const ra = Array.from({ length: 50 }, () => rollDie(a.g, 0, 20));
    const rb = Array.from({ length: 50 }, () => rollDie(b.g, 0, 20));
    expect(ra).toEqual(rb);
    expect(ra.every((r) => r >= 1 && r <= 20)).toBe(true);
    expect(new Set(ra).size).toBeGreaterThan(5);
    expect(a.state.log.at(-1)!.text).toContain('rola um d20');
  });
});
