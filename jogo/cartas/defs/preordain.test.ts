import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Preordain', () => {
  it('vidência 2 e depois compra uma carta', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Preordain'], []], library: [['Plains', 'Swamp', 'Forest', 'Mountain'], []] });
    let pediuVidencia = false;
    tg.script.push((d) => { if (d.kind !== 'priority' && d.kind !== 'payment' && /vid[êe]ncia|topo|fundo/i.test(d.prompt)) pediuVidencia = true; return null; });
    tg.cast('Preordain').resolveAll();
    expect(pediuVidencia).toBe(true);
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.state.zones.library[0]).toHaveLength(3);
    expect(tg.find('Preordain', 'graveyard', 0)).not.toBeNull();
  });

  it('CR 701.22a: as duas olhadas vão para o fundo e a compra é a carta seguinte', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Preordain'], []], library: [['Plains', 'Swamp', 'Forest', 'Mountain'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) } : null));
    tg.cast('Preordain').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.names(0, 'library')).toEqual(['Mountain', 'Plains', 'Swamp']);
  });
});
