import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy, hasKw, putOntoBattlefield } from '../../motor/api.ts';

const TA = 'Temur Ascendancy';

describe(TA, () => {
  it('as suas criaturas têm ímpeto enquanto ela estiver no campo', () => {
    const tg = setup({ battlefield: [[TA, 'Elvish Mystic'], ['Dragon Whelp']] });
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'haste')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Dragon Whelp'), 'haste')).toBe(false);
    tg.run(destroy(tg.g, [tg.bf(TA)]));
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'haste')).toBe(false);
  });
  it('compra (se quiser) quando entra uma criatura sua com força 4 ou mais', () => {
    const tg = setup({ battlefield: [[TA], []], hand: [['Zetalpa, Primal Dawn', 'Elvish Mystic'], []], library: [['Island'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Elvish Mystic', 'hand', 0)!, controller: 0 }], 'effect'));
    expect(tg.state.zones.stack.length).toBe(0);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Zetalpa, Primal Dawn', 'hand', 0)!, controller: 0 }], 'effect'));
    tg.yes('comprar uma carta', true).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
