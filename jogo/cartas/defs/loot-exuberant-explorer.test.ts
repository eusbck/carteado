import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Loot, Exuberant Explorer';

describe(N, () => {
  it('você pode jogar dois terrenos no seu turno', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest', 'Forest', 'Forest'], []] });
    tg.play('Forest').play('Forest');
    expect(() => tg.play('Forest')).toThrow();
    const sem = setup({ battlefield: [[], []], hand: [['Forest', 'Forest'], []] });
    sem.play('Forest');
    expect(() => sem.play('Forest')).toThrow();
  });

  it('olha seis e põe no campo uma criatura com valor de mana até o número de terrenos', () => {
    const tg = setup({
      battlefield: [[N, ...Array(6).fill('Forest')], []],
      library: [['Gigantosaurus', "Verdant Sun's Avatar", 'Ripjaw Raptor', 'Sol Ring', 'Island', 'Plains', 'Swamp'], []],
    });
    let oferecidas: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Loot:') ? (oferecidas = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Gigantosaurus')!.id] }) : null));
    tg.activate(N).resolve();
    // 6 terrenos: Verdant Sun's Avatar (7) não pode
    expect(oferecidas.sort()).toEqual(['Gigantosaurus', 'Ripjaw Raptor']);
    expect(tg.find('Gigantosaurus')).not.toBeNull();
    const lib = tg.names(0, 'library');
    expect(lib[0]).toBe('Swamp');
    expect(lib.slice(1).sort()).toEqual(['Island', 'Plains', 'Ripjaw Raptor', 'Sol Ring', "Verdant Sun's Avatar"]);
  });
});
