import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Wyleth, Soul of Steel';

describe(N, () => {
  it('conta as Auras e os Equipamentos anexados na resolução', () => {
    const tg = setup({
      battlefield: [[N, { name: 'Lightning Greaves', attachTo: N }, { name: 'Swiftfoot Boots', attachTo: N }, 'Shadowspear'], []],
      hand: [[], []], step: 'beginCombat',
    });
    tg.attack([[N, 1]]).passUntil((t) => t.state.zones.stack.length > 0);
    expect(tg.state.zones.stack.length).toBe(1);
    // em resposta, mais um Equipamento é anexado: conta três
    tg.state.objects[tg.bf('Shadowspear')].attachedTo = tg.bf(N);
    tg.refresh();
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(3);
  });
});
