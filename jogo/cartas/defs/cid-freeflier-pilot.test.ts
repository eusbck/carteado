import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Cid, Freeflier Pilot';

describe(C, () => {
  it('ruling 1 e 2: reduz {1} da parte genérica do custo total', () => {
    const tg = setup({ battlefield: [[C, 'Plains'], []], hand: [['Basilisk Collar'], []] });
    expect(tg.canCast('Basilisk Collar')).toBe(true);
    tg.cast('Basilisk Collar').resolve();
    expect(tg.find('Basilisk Collar')).not.toBeNull();
  });
  it('Pular: tem voar só no seu turno', () => {
    const tg = setup({ battlefield: [[C], []] });
    expect(hasKw(tg.g, tg.bf(C), 'flying')).toBe(true);
    const tg2 = setup({ battlefield: [[C], []], active: 1 });
    expect(hasKw(tg2.g, tg2.bf(C), 'flying')).toBe(false);
  });
  it('{2}, {T}: devolve um Equipamento do cemitério para a mão', () => {
    const tg = setup({ battlefield: [[{ name: C, ready: true }, 'Plains', 'Plains'], []], graveyard: [['Basilisk Collar'], []] });
    tg.choose('Equipamento ou Veículo', ['Basilisk Collar']).activate(C, 'Devolva').resolve();
    expect(tg.names(0, 'hand')).toContain('Basilisk Collar');
  });
});
