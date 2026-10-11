import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Reign of the Pit';
const pantanos = Array(6).fill('Swamp');

describe(N, () => {
  it('cada jogador sacrifica uma criatura à escolha dele, e o Demon tem a soma das forças sacrificadas', () => {
    const tg = setup({
      players: 3, hand: [[N], [], []],
      battlefield: [[...pantanos, 'Elvish Mystic'], ['Indomitable Ancients', 'Lathliss, Dragon Queen'], ['Wall of Omens']],
    });
    const quem: number[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith(N)) return null;
      quem.push(d.player);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.cast(N).resolveAll();
    // só Bruno tinha escolha; os outros sacrificam a única criatura que têm
    expect(quem).toEqual([1]);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Lathliss, Dragon Queen')).not.toBeNull();
    // forças: 1 + 2 + 0 = 3
    const demon = tg.bf('Demon X/X');
    expect(tg.pt(demon)).toEqual([3, 3]);
    expect(chars(tg.g, demon).colors).toEqual(['B']);
    expect(hasKw(tg.g, demon, 'flying')).toBe(true);
    expect(tg.state.objects[demon].controller).toBe(0);
  });

  it('sem nenhuma criatura para sacrificar, o Demon 0/0 morre', () => {
    const tg = setup({ battlefield: [pantanos, []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Demon X/X')).toBeNull();
  });
});
