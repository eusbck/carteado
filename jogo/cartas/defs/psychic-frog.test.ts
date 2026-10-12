import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Psychic Frog';

describe(N, () => {
  it('descarte: marcador +1/+1; exile três do cemitério: voar; o dano de combate a um jogador compra', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Island'], []], graveyard: [['Swamp', 'Swamp', 'Swamp'], []], library: [['Forest', 'Forest'], ['Island']] });
    const sapo = tg.bf(N);
    const base = tg.pt(sapo);
    tg.script.push((d) => (d.kind === 'select' && /[Dd]escart/.test(d.prompt) ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.activate(N, 'Descarte').resolveAll();
    expect(tg.pt(sapo)).toEqual([base[0] + 1, base[1] + 1]);
    tg.script.push((d) => (d.kind === 'select' && /[Ee]xil/.test(d.prompt) ? { kind: 'select', ids: d.items.slice(0, 3).map((i) => i.id) } : null));
    tg.activate(N, 'Exile três').resolveAll();
    expect(hasKw(tg.g, sapo, 'flying')).toBe(true);
    expect(tg.names(0, 'exile')).toHaveLength(3);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});