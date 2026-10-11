import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Metalwork Colossus';

describe(N, () => {
  it('custa {X} a menos, X igual ao valor de mana total dos seus artefatos que não são criaturas', () => {
    // Thran Dynamo (4) + Darksteel Ingot (3) + Coveted Jewel (6) = 13: custa {0}
    const tg = setup({ battlefield: [['Thran Dynamo', 'Darksteel Ingot', 'Coveted Jewel'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([10, 10]);
    expect(tg.state.objects[tg.bf('Thran Dynamo')].tapped).toBe(false);
    // criatura artefato não conta: Silver Myr (2) não reduz
    const sem = setup({ battlefield: [['Silver Myr', 'Island'], []], hand: [[N], []] });
    expect(sem.canCast(N)).toBe(false);
  });

  it('do cemitério, sacrificando dois artefatos, volta para a mão', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Darksteel Ingot'], []], graveyard: [[N], []] });
    tg.activate(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual([N]);
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Darksteel Ingot')).toBeNull();
  });
});