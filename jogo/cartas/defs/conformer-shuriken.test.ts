import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Conformer Shuriken';

describe(N, () => {
  it('ao atacar, vira a criatura alvo do defensor e ganha marcadores +1/+1 iguais à diferença de força', () => {
    // Silver Myr 1/1 contra Zetalpa 4/8: diferença 3
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Silver Myr' }, 'Silver Myr'], ['Zetalpa, Primal Dawn', 'Elvish Mystic']] });
    tg.choose('jogador defensor controla', ['Zetalpa, Primal Dawn']).attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Silver Myr')].counters['+1/+1']).toBe(3);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 4]);
  });

  it('com força menor ou igual, só vira a criatura; o Equipamento sozinho não dá a habilidade a outras', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Silver Myr' }, 'Silver Myr', 'Wall of Omens'], ['Elvish Mystic']] });
    tg.choose('jogador defensor controla', ['Elvish Mystic']).attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Silver Myr')].counters['+1/+1'] ?? 0).toBe(0);
  });

  it('a criatura sem o Equipamento não ganha a habilidade', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], ['Elvish Mystic']] });
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(false);
  });
});
