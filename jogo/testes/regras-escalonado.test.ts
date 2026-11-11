// Escalonado / tiered (CR 702.183): "escolha um; como custo adicional, pague o custo associado a esse modo".
// motor/conjurar-alternativo.ts tiered() + AdditionalCostDef.perMode (motor/stack.ts).
import { describe, expect, it } from 'vitest';
import { totalSpellCost } from '../motor/stack.ts';
import { formatCost } from '../motor/mana.ts';
import { fixture as setup } from './artefatos.ts';

const CLB = "Cloud's Limit Break";
const RAIO = 'Raio da Lâmina — {1} — Destrua qualquer número de criaturas viradas alvo com controladores diferentes';
const OMNI = 'Omnicorte — {3}{W} — Destrua todas as criaturas viradas';
const planicies = (n: number) => Array(n).fill('Plains');

describe('Escalonado (CR 702.183)', () => {
  it('CR 702.183a, 601.2f: só o custo do modo escolhido entra no custo total', () => {
    const tg = setup({ battlefield: [[...planicies(6)], []], hand: [[CLB], []] });
    const o = tg.state.objects[tg.find(CLB, 'hand', 0)!];
    const metodo = { key: 'hand', label: 'conjurar', zone: 'hand' as const };
    const custo = (paid: Record<string, boolean>) => formatCost(totalSpellCost(tg.g, 0, o, metodo, { x: 0, targets: [], paid }));
    expect(custo({})).toBe('{1}{W}');
    expect(custo({ 'tiered:0': true })).toBe('{1}{W}');
    expect(custo({ 'tiered:1': true })).toBe('{2}{W}');
    expect(custo({ 'tiered:2': true })).toBe('{4}{W}{W}');
  });

  it('CR 702.183a: o custo do modo é cobrado sem pergunta ao conjurar', () => {
    const tg = setup({ battlefield: [[...planicies(3)], []], hand: [[CLB], []] });
    let perguntou = false;
    tg.script.push((d) => { if (d.prompt.includes('custo adicional')) perguntou = true; return null; });
    tg.choose('modo', [RAIO]).cast(CLB);
    expect(perguntou).toBe(false);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(3);
  });

  it('CR 601.2h, 733: sem mana para o custo do modo escolhido, a conjuração é desfeita', () => {
    const tg = setup({ battlefield: [[...planicies(5)], []], hand: [[CLB], []] });
    tg.choose('modo', [OMNI]);
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', cancel: true } : null));
    tg.cast(CLB);
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.find(CLB, 'hand', 0)).not.toBeNull();
  });
});
