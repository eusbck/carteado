// lote3-f: spree (CR 702.172a), em motor/stack.ts (AdditionalCostDef.perMode, do lote3-e) e motor/cedh.ts spreeModos
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';

const NOME = 'Lively Dirge';

describe('spree', () => {
  it('CR 702.172a: o custo de cada modo escolhido entra no custo total; o de um modo não escolhido, não', () => {
    // {1}{B} + {1} do primeiro modo = 3 manas
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Island', 'Island'], []] });
    tg.choose('escolha de 1 a 2 modo', ['+ {1} — Procure uma carta no seu grimório, coloque-a no seu cemitério e embaralhe']);
    tg.cast(NOME).resolve();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(3);
  });

  it('CR 702.172a: os dois modos custam os dois custos', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Island', 'Island'], []] });
    tg.choose('escolha de 1 a 2 modo', [
      '+ {1} — Procure uma carta no seu grimório, coloque-a no seu cemitério e embaralhe',
      '+ {2} — Devolva até duas cartas de criatura com valor de mana total 4 ou menos do seu cemitério ao campo',
    ]);
    tg.cast(NOME).resolve();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(5);
  });
});
