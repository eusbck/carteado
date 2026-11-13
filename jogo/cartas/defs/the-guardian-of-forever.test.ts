import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'The Guardian of Forever';

describe(N, () => {
  it('sacrifica outra criatura que não é ficha e ela volta do cemitério no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island', 'Island', 'Wall of Omens'], []], library: [['Forest', 'Forest'], []] });
    tg.choose('Sacrifique', ['Wall of Omens']);
    tg.activate(N).resolveAll();
    expect(tg.find('Wall of Omens', 'graveyard')).not.toBeNull();
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.find('Wall of Omens', 'battlefield')).not.toBeNull();
  });
});
