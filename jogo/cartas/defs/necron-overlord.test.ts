import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Necron Overlord';

describe(N, () => {
  it('{X}, {T}, vire X artefatos desvirados: o oponente alvo perde X de vida', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Arcade Cabinet', 'Mask of Memory', 'Cranial Plating'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 5]);
    const vida = tg.life(1);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('oponente alvo') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.number('X', 2).choose('Vire 2', ['Arcade Cabinet', 'Mask of Memory']).activate(N).resolveAll();
    expect(tg.life(1)).toBe(vida - 2);
    expect(tg.state.objects[tg.bf('Arcade Cabinet')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Mask of Memory')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Cranial Plating')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});