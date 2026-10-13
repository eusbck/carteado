import { describe, expect, it } from 'vitest';
import { controllerOf, hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Emenda Pix';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('você pega a criatura até o fim do turno, desvirada e com ímpeto, e o dono cria dois Tesouros', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], [{ name: 'Indomitable Ancients', tapped: true }]], hand: [[N], []], library: [lib, lib] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    const a = tg.bf('Indomitable Ancients');
    expect(controllerOf(tg.g, a)).toBe(0);
    expect(tg.state.objects[a].tapped).toBe(false);
    expect(hasKw(tg.g, a, 'haste')).toBe(true);
    expect(tg.names(1, 'battlefield').filter((n) => n === 'Treasure')).toHaveLength(2);
    tg.passTo('upkeep', 1);
    expect(controllerOf(tg.g, tg.bf('Indomitable Ancients'))).toBe(1);
  });
});
