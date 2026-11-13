import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "M'Ress, Crew Coordinator";

describe(N, () => {
  it('jogando um terreno, cria duas fichas Officer 1/1 vermelhas', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Plains'], []] });
    tg.play('Plains').resolveAll();
    const fichas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Officer');
    expect(fichas.length).toBe(2);
    expect(tg.pt(fichas[0])).toEqual([1, 1]);
  });
});
