import { describe, expect, it } from 'vitest';
import { chars, controllerOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Assimilation Assessor';

describe(N, () => {
  it('ao entrar exila o cemitério do oponente alvo; ao atacar assimila uma criatura exilada com ele', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp')], []], graveyard: [[], ['Zetalpa, Primal Dawn', 'Island']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(1, 'exile').sort()).toEqual(['Island', 'Zetalpa, Primal Dawn']);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    const z = tg.bf('Zetalpa, Primal Dawn');
    expect(controllerOf(tg.g, z)).toBe(0);
    expect(chars(tg.g, z).types).toContain('Artifact');
    expect(tg.names(1, 'exile')).toEqual(['Island']);
  });
});
