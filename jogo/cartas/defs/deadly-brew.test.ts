import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Deadly Brew', () => {
  it('não pode devolver a carta que sacrificou', () => {
    const tg = setup({
      battlefield: [['Elvish Mystic', 'Swamp', 'Forest'], ['Indomitable Ancients', 'Zetalpa, Primal Dawn']],
      graveyard: [['Wall of Omens'], []], hand: [['Deadly Brew'], []],
    });
    let opcoes: string[] = [];
    tg.choose('Sacrifique', ['Indomitable Ancients']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Deadly Brew')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast('Deadly Brew').resolve();
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Deadly Brew', 'Elvish Mystic']);
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
  });
  it('escolhe o que devolver depois dos sacrifícios', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest'], ['Indomitable Ancients']], graveyard: [['Wall of Omens'], []], hand: [['Deadly Brew'], []] });
    tg.cast('Deadly Brew').resolve();
    // Ana não sacrificou nada: não devolve
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
  });
});
