import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Shipwreck Marsh', () => {
  it('entra virado com menos de dois outros terrenos', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Shipwreck Marsh'], []] });
    tg.play('Shipwreck Marsh');
    expect(tg.state.objects[tg.bf('Shipwreck Marsh')].tapped).toBe(true);
  });
});
