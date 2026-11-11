// Farra / spree (CR 702.172a): "escolha um ou mais modos; como custo adicional, pague os custos desses modos". Os modos
// são escolhidos antes dos custos (CR 601.2b) e cada modo escolhido soma o seu custo (motor/mecanicas-ur.ts spree,
// AdditionalCostDef.perMode em motor/stack.ts).
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { spree } from '../motor/api.ts';

const SS = "Smuggler's Surprise";
const virados = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length;
const escolhe = (prefixos: string[]) => (d: { kind: string; prompt: string; items?: { id: string; label: string }[] }) =>
  d.kind === 'select' && d.prompt.includes('modo') ? { kind: 'select' as const, ids: d.items!.filter((i) => prefixos.some((p) => i.label.startsWith(p))).map((i) => i.id) } : null;

describe('Farra (CR 702.172)', () => {
  it('spree() monta um custo adicional por modo, pago só se o modo for escolhido', () => {
    const cs = spree(['{2}', '{4}{G}']);
    expect(cs.map((c) => [c.perMode, c.optional])).toEqual([[0, false], [1, false]]);
  });

  it('CR 702.172a: só o terceiro modo custa a mágica mais {1}', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Forest'), 'Zetalpa, Primal Dawn'], []], hand: [[SS], []] });
    tg.script.push(escolhe(['+ {1}']) as never);
    tg.cast(SS);
    expect(virados(tg)).toBe(2);
  });

  it('CR 702.172a: dois modos somam os dois custos', () => {
    const tg = setup({ battlefield: [[...Array(9).fill('Forest')], []], hand: [[SS], []], library: [['Island', 'Island', 'Island', 'Island'], []] });
    tg.script.push(escolhe(['+ {2}', '+ {1}']) as never);
    tg.cast(SS);
    expect(virados(tg)).toBe(4);
  });
});
