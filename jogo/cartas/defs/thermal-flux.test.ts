import { describe, expect, it } from 'vitest';
import { addEffect, chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Thermal Flux';

describe(N, () => {
  it('o permanente vira snow e continua com os outros tipos; no fim do turno, volta; compra na próxima manutenção', () => {
    const tg = setup({ battlefield: [['Island'], ['Forest']], hand: [[N], []], library: [['Opt'], ['Swamp']] });
    tg.choose('modo(s)', ['O permanente alvo que não é snow vira snow até o fim do turno']).choose('permanente alvo que não é snow', ['Forest']).cast(N).resolve();
    const f = tg.bf('Forest');
    expect(chars(tg.g, f).supertypes).toEqual(['Basic', 'Snow']);
    expect(chars(tg.g, f).subtypes).toEqual(['Forest']);
    expect(tg.names(0, 'hand')).toEqual([]);
    tg.passTo('upkeep', 1).resolveAll();
    expect(chars(tg.g, f).supertypes).toEqual(['Basic']);
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
  });
  it('o permanente snow deixa de ser snow até o fim do turno', () => {
    const tg = setup({ battlefield: [['Island'], ['Forest']], hand: [[N], []], library: [['Opt'], ['Swamp']] });
    const f = tg.bf('Forest');
    addEffect(tg.g, { source: f, sourceDef: '', controller: 1, duration: { kind: 'permanent' }, affected: [f], mods: [{ k: 'addTypes', supertypes: ['Snow'] }] });
    tg.refresh();
    tg.choose('modo(s)', ['O permanente alvo snow deixa de ser snow até o fim do turno']).choose('permanente alvo snow', ['Forest']).cast(N).resolve();
    expect(chars(tg.g, f).supertypes).toEqual(['Basic']);
  });
});
