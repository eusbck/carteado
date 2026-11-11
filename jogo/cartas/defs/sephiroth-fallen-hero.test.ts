import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Sephiroth, Fallen Hero';

describe(C, () => {
  it('as criaturas modificadas viram 7/5 base; +1/+1 continua por cima', () => {
    const tg = setup({ battlefield: [[{ name: C, ready: true }, { name: 'Elvish Mystic', counters: { '+1/+1': 1 } }, 'Wall of Omens'], ['Indomitable Ancients']], step: 'main1' });
    tg.choose('criatura alvo', [C]).yes('marcador de célula');
    tg.attack([[C, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([8, 6]);
    expect(tg.pt(tg.bf(C))).toEqual([7, 5]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
  it('A Reunião: do cemitério, sacrificando uma criatura modificada, volta ao campo virado', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', { name: 'Elvish Mystic', counters: { '+1/+1': 1 } }], []], graveyard: [[C], []] });
    tg.choose('Sacrifique', ['Elvish Mystic']).activate(C, 'Reunião').resolve();
    const s = tg.bf(C);
    expect(tg.state.objects[s].tapped).toBe(true);
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});
