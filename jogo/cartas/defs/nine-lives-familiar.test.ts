import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Nine-Lives Familiar";

describe(C, () => {
  it('conjurada entra com oito marcadores de renascimento', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Swamp')], []], hand: [[C], []] });
    tg.cast(C).resolve();
    expect(tg.state.objects[tg.bf(C)].counters.revival).toBe(8);
  });
  it('ao morrer com marcador, volta na próxima etapa final com um a menos', () => {
    const tg = setup({ battlefield: [[{ name: C, counters: { revival: 3 } }, 'Swamp'], []], hand: [['Innocent Blood'], []], library: [['Opt'], ['Opt']] });
    tg.cast('Innocent Blood').resolve().resolveAll();
    expect(tg.find(C)).toBeNull();
    tg.passTo('end').resolveAll();
    expect(tg.state.objects[tg.bf(C)].counters.revival).toBe(2);
  });
});
