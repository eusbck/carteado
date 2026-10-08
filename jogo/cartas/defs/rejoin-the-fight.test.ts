import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Rejoin the Fight', () => {
  it('cada oponente, em ordem, escolhe uma criatura diferente para voltar', () => {
    const tg = setup({
      players: 3, battlefield: [[...Array(6).fill('Swamp')], [], []], hand: [['Rejoin the Fight'], [], []],
      graveyard: [['Wall of Omens', 'Glissa Sunslayer', 'Archfiend of Depravity'], [], []], library: [['Island', 'Island', 'Island', 'Plains'], [], []],
    });
    let segundaOpcoes: string[] = [];
    tg.choose('Rejoin the Fight', ['Wall of Omens']);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Rejoin the Fight') ? (segundaOpcoes = d.items.map((i) => i.label).sort(), { kind: 'select', ids: [d.items.find((i) => i.label === 'Glissa Sunslayer')!.id] }) : null));
    tg.cast('Rejoin the Fight').resolve().resolveAll();
    expect(segundaOpcoes).toEqual(['Archfiend of Depravity', 'Glissa Sunslayer']);
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
    expect(tg.find('Archfiend of Depravity')).toBeNull();
  });
});
