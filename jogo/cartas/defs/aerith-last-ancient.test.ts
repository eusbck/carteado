import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Aerith, Last Ancient';

describe(C, () => {
  it('ganhou vida: a criatura volta para a mão', () => {
    const tg = setup({ battlefield: [[C], []], graveyard: [['Elvish Mystic'], []], step: 'main2' });
    gainLife(tg.g, 0, 2, tg.bf(C));
    tg.choose('criatura', ['Elvish Mystic']);
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toContain('Elvish Mystic');
  });
  it('sem ganhar vida, não dispara; com 7 ou mais, a carta volta ao campo', () => {
    const tg = setup({ battlefield: [[C], []], graveyard: [['Elvish Mystic'], []], step: 'main2' });
    tg.passTo('end');
    expect(tg.state.zones.stack.length).toBe(0);
    const tg2 = setup({ battlefield: [[C], []], graveyard: [['Elvish Mystic'], []], step: 'main2' });
    gainLife(tg2.g, 0, 7, tg2.bf(C));
    tg2.choose('criatura', ['Elvish Mystic']);
    tg2.passTo('end');
    tg2.resolveAll();
    expect(tg2.find('Elvish Mystic')).not.toBeNull();
  });
});
