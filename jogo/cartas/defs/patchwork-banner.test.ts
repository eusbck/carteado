import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Patchwork Banner', () => {
  it('só tipos de criatura existentes aparecem na escolha', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Plains'], []], hand: [['Patchwork Banner'], []] });
    let labels: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('tipo de criatura')) return null;
      labels = d.items.map((i) => i.label);
      return { kind: 'select', ids: ['Wall'] };
    });
    tg.cast('Patchwork Banner').resolve();
    expect(labels).toContain('Wall');
    expect(labels).not.toContain('Artifact');
  });

  it('criaturas suas do tipo escolhido recebem +1/+1', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Plains', 'Wall of Omens', 'Indomitable Ancients'], ['Wall of Omens']], hand: [['Patchwork Banner'], []] });
    tg.choose('tipo de criatura', ['Wall']).cast('Patchwork Banner').resolve();
    expect(tg.pt(tg.bf('Wall of Omens', 0))).toEqual([1, 5]);
    expect(tg.pt(tg.bf('Wall of Omens', 1))).toEqual([0, 4]); // de outro jogador
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
  });

  it('produz mana de qualquer cor', () => expect(alternativasDeMana('Patchwork Banner')).toEqual(['B', 'G', 'R', 'U', 'W']));
});
