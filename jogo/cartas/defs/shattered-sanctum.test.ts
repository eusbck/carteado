import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Shattered Sanctum', () => {
  it('entra virado com menos de dois outros terrenos', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Shattered Sanctum'], []] });
    tg.play('Shattered Sanctum');
    expect(tg.state.objects[tg.bf('Shattered Sanctum')].tapped).toBe(true);
  });
});
