import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Tranquil Landscape';

describe(NOME, () => {
  it('CR 605: {T}: adiciona {C}', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('sacrifica e busca Forest, Plains ou Island básico para o campo, virado (não Swamp nem não básico)', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Swamp', 'Hinterland Harbor', 'Island', 'Forest', 'Plains'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Forest, Plains ou Island')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Forest')!.id] };
    });
    tg.activate(NOME, 'Sacrifique').resolve();
    expect(opcoes).toEqual(['Forest', 'Island', 'Plains']);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });
  it('CR 702.29: ciclagem {G}{W}{U}: descarta e compra', () => {
    const tg = setup({ battlefield: [['Forest', 'Plains', 'Island'], []], hand: [[NOME], []], library: [['Swamp'], []] });
    tg.activate(NOME, 'Ciclagem').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
  });
});
