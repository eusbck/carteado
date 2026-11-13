import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import type { Decision } from '../../motor/types.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Season of Gathering';
const FLORESTAS = Array(6).fill('Forest');
/** responde à escolha de modo com patinhas pelo modo de índice i (ou nenhum, com null) */
const modo = (i: number | null) => (d: Decision) => (d.kind === 'select' && d.prompt.includes('patinha') ? { kind: 'select' as const, ids: i === null ? [] : [String(i)] } : null);

describe(N, () => {
  it('um, dois e dois: o marcador, depois destrói os artefatos e depois os encantamentos', () => {
    const tg = setup({ battlefield: [[...FLORESTAS, 'Llanowar Elves', 'Sol Ring'], ['Hardened Scales']], hand: [[N], []] });
    tg.script.push(modo(0), modo(1), modo(1));
    tg.choose('artefato ou encantamento', ['Artefato']).choose('artefato ou encantamento', ['Encantamento']);
    tg.cast(N).resolve();
    const elfo = tg.bf('Llanowar Elves');
    expect(tg.state.objects[elfo].counters['+1/+1']).toBe(1);
    expect(hasKw(tg.g, elfo, 'trample')).toBe(true);
    expect(hasKw(tg.g, elfo, 'vigilance')).toBe(true);
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Hardened Scales')).toBeNull();
  });
  it('pode escolher menos de cinco patinhas, inclusive nenhum modo', () => {
    const tg = setup({ battlefield: [[...FLORESTAS, 'Indomitable Ancients'], []], hand: [[N], []], library: [['Island', 'Island', 'Island'], []] });
    tg.script.push(modo(2), modo(null));
    tg.cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Island']);
    const nada = setup({ battlefield: [[...FLORESTAS], []], hand: [[N], []] });
    nada.script.push(modo(null));
    nada.cast(N).resolve();
    expect(nada.names(0, 'graveyard')).toEqual([N]);
  });
});
