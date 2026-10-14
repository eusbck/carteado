import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Squirrel Nest';

describe(NOME, () => {
  it('o terreno encantado ganha "{T}: crie uma ficha Squirrel 1/1"', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Swamp'], []], hand: [[NOME], []] });
    tg.choose('terreno', ['Swamp']).cast(NOME).resolve();
    tg.activate('Swamp', 'Squirrel').resolve();
    const s = tg.bf('Squirrel');
    expect(tg.pt(s)).toEqual([1, 1]);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
  });
});
