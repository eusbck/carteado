import { describe, expect, it } from 'vitest';
import { exile, tap } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Seize the Day';
const combates = (tg: ReturnType<typeof setup>) => tg.state.turn.queue.filter((s) => s === 'declareAttackers').length;

describe(N, () => {
  it('desvira a criatura alvo e cria um combate e uma fase principal adicionais', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Mountain'), 'Elvish Mystic'], []], hand: [[N], []] });
    const elfo = tg.bf('Elvish Mystic');
    tap(tg.g, elfo);
    const antes = combates(tg);
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N).resolveAll();
    expect(tg.state.objects[elfo].tapped).toBe(false);
    expect(combates(tg)).toBe(antes + 1);
    expect(tg.state.turn.queue.filter((s) => s === 'main2')).toHaveLength(2);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('com o alvo ilegal, não há combate adicional', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Mountain'), 'Elvish Mystic'], []], hand: [[N], []] });
    const antes = combates(tg);
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N);
    tg.run(exile(tg.g, [tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(combates(tg)).toBe(antes);
  });

  it('conjurada pela retrospectiva, vai para o exílio', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Mountain'), 'Elvish Mystic'], []], graveyard: [[N], []] });
    const antes = combates(tg);
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N, 'flashback').resolveAll();
    expect(combates(tg)).toBe(antes + 1);
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'exile')).toEqual([N]);
  });
});
