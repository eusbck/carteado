import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Contaminated Landscape';

describe(NOME, () => {
  it('CR 605: {T}: adiciona {C}', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('sacrifica e busca Plains, Island ou Swamp básico para o campo, virado (não Mountain nem não básico)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Mountain', 'Turbulent Shore', 'Plains', 'Island', 'Swamp'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Plains, Island ou Swamp')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Island')!.id] };
    });
    tg.activate(NOME, 'Sacrifique').resolve();
    expect(opcoes).toEqual(['Island', 'Plains', 'Swamp']);
    expect(tg.find(NOME)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.state.zones.library[0].length).toBe(4);
  });
  it('CR 702.29: ciclagem {W}{U}{B} — descarta e compra', () => {
    const tg = setup({ battlefield: [['Plains', 'Island', 'Swamp'], []], hand: [[NOME], []], library: [['Forest'], []] });
    tg.activate(NOME, 'Ciclagem').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
  it('sem as três cores, não dá para ciclar', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring'], []], hand: [[NOME], []], library: [['Forest'], []] });
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.label.includes('Ciclagem'))).toBe(false);
  });
});
