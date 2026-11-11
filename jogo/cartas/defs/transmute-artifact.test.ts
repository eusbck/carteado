import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Transmute Artifact';

describe(N, () => {
  it('com valor de mana menor ou igual, entra no campo sem pagar', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Mind Stone'], []], hand: [[N], []], library: [['Sol Ring', 'Thran Dynamo'], []] });
    tg.choose('sacrifique um artefato', ['Mind Stone']).choose('procure uma carta de artefato', ['Sol Ring']).cast(N).resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Mind Stone', N].sort());
  });
  it('com valor de mana maior, pode pagar a diferença na resolução; sem pagar, a carta vai para o cemitério', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Mind Stone'], []], hand: [[N], []], library: [['Thran Dynamo', 'Grim Monolith'], []] });
    tg.choose('sacrifique um artefato', ['Mind Stone']).choose('procure uma carta de artefato', ['Thran Dynamo']).yes('Pagar {2}', true).cast(N).resolve();
    expect(tg.find('Thran Dynamo')).not.toBeNull();
    const tg2 = setup({ battlefield: [['Island', 'Island', 'Mind Stone'], []], hand: [[N], []], library: [['Thran Dynamo'], []] });
    tg2.choose('sacrifique um artefato', ['Mind Stone']).choose('procure uma carta de artefato', ['Thran Dynamo']).yes('Pagar {2}', false).cast(N).resolve();
    expect(tg2.find('Thran Dynamo')).toBeNull();
    expect(tg2.names(0, 'graveyard').sort()).toEqual(['Mind Stone', 'Thran Dynamo', N].sort());
  });
  it('sem artefato para sacrificar, nada acontece', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], library: [['Sol Ring'], []] });
    tg.cast(N).resolve();
    expect(tg.names(0, 'library')).toEqual(['Sol Ring']);
  });
});
