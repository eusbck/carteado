import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Venerable Warsinger', () => {
  it('devolve criatura com valor de mana até o dano causado', () => {
    const tg = setup({
      battlefield: [[{ name: 'Venerable Warsinger', ready: true }], []], graveyard: [['Wall of Omens', 'Glissa Sunslayer', 'Archfiend of Depravity'], []], library: [['Island'], ['Island']],
    });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('até o dano causado') ? (opcoes = d.items.map((i) => i.label).sort(), { kind: 'select', ids: [d.items.find((i) => i.label === 'Glissa Sunslayer')!.id] }) : null));
    tg.yes('Venerable Warsinger');
    tg.attack([['Venerable Warsinger', 1]]).passTo('main2');
    expect(opcoes).toEqual(['Glissa Sunslayer', 'Wall of Omens']); // 3 de dano: Archfiend (5) fica de fora
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
  });
});
