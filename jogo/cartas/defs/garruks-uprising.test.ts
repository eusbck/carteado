import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = "Garruk's Uprising";

describe(N, () => {
  it('ao entrar, compra uma carta só se você controla uma criatura com força 4 ou mais', () => {
    const fraca = fixture({ battlefield: [['Indomitable Ancients', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    fraca.cast(N).resolveAll();
    expect(fraca.state.zones.hand[0]).toHaveLength(0);
    expect(hasKw(fraca.g, fraca.bf('Indomitable Ancients'), 'trample')).toBe(true);
    const forte = fixture({ battlefield: [['Zetalpa, Primal Dawn', 'Indomitable Ancients', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    forte.cast(N).resolveAll();
    expect(forte.state.zones.hand[0]).toHaveLength(1);
  });

  it('criatura que entra com força 4 ou mais compra uma carta; com força menor, não', () => {
    const tg = fixture({ battlefield: [[N], []] });
    enterCard(tg, 'Indomitable Ancients', 0);
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(0);
    enterCard(tg, 'Zetalpa, Primal Dawn', 0);
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
    // criatura do oponente não conta
    enterCard(tg, 'Zetalpa, Primal Dawn', 1);
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });
});
