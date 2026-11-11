import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Deserted Beach', () => {
  it('entra virado com menos de dois outros terrenos e desvirado com dois', () => {
    let tg = setup({ battlefield: [['Island'], []], hand: [['Deserted Beach'], []] });
    tg.play('Deserted Beach');
    expect(tg.state.objects[tg.bf('Deserted Beach')].tapped).toBe(true);
    tg = setup({ battlefield: [['Island', 'Plains'], []], hand: [['Deserted Beach'], []] });
    tg.play('Deserted Beach');
    expect(tg.state.objects[tg.bf('Deserted Beach')].tapped).toBe(false);
  });
});
