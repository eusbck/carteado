import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dread Return';

describe(N, () => {
  it('devolve ao campo uma carta de criatura do seu cemitério', () => {
    const tg = setup({ battlefield: [Array(4).fill('Swamp'), []], hand: [[N], []], graveyard: [['Serra Angel'], []] });
    tg.choose('carta de criatura alvo no seu cemitério', ['Serra Angel']).cast(N).resolveAll();
    expect(tg.find('Serra Angel')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('recapitular sacrificando três criaturas: conjurada do cemitério e depois exilada', () => {
    const tg = setup({ battlefield: [['Silver Myr', 'Elvish Mystic', 'Wall of Omens'], []], graveyard: [[N, 'Serra Angel'], []] });
    tg.choose('carta de criatura alvo no seu cemitério', ['Serra Angel']).choose('Sacrifique', ['Silver Myr', 'Elvish Mystic', 'Wall of Omens']).cast(N, 'flashback').resolveAll();
    expect(tg.find('Serra Angel')).not.toBeNull();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.names(0, 'exile')).toEqual([N]);
  });
});