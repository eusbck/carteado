import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Orb of Dragonkind';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('CR 106.6: as duas manas só pagam mágicas de Dragon', () => {
    // Rapacious Dragon custa {4}{R}: três Mountains + o Orb ({1}, {T}: duas manas) = três de mana das Mountains e duas do Orb
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [['Rapacious Dragon', 'Indomitable Ancients'], []] });
    expect(tg.canCast('Rapacious Dragon')).toBe(true);
    tg.cast('Rapacious Dragon').resolveAll();
    expect(tg.find('Rapacious Dragon')).not.toBeNull();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.all('Mountain').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });

  it('a mana do Orb não paga mágica que não é de Dragon', () => {
    // Sol Ring custa {1}: só com o Orb e uma Mountain (que paga o {1} do Orb) não dá para conjurar
    const tg = setup({ battlefield: [[N, 'Mountain'], []], hand: [['Wall of Omens'], []] });
    const com = setup({ battlefield: [['Mountain', 'Plains'], []], hand: [['Wall of Omens'], []] });
    expect(com.canCast('Wall of Omens')).toBe(true);
    expect(tg.canCast('Wall of Omens')).toBe(false);
  });

  it('olha sete cartas, só uma carta de Dragon pode ir para a mão e o resto vai para o fundo', () => {
    // Dragon's Hoard tem "Dragon" no nome mas não é uma carta de Dragon
    const topo = ['Plains', "Dragon's Hoard", 'Goldspan Dragon', 'Island', 'Swamp', 'Plains', 'Island'];
    const tg = setup({ battlefield: [[N, 'Mountain'], []], library: [[...topo, ...forests], forests] });
    let desabilitadas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith(N)) return null;
      desabilitadas = d.items.filter((i) => i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Goldspan Dragon')!.id] };
    });
    tg.activate(N, 'Sacrifique').resolveAll();
    expect(desabilitadas).toHaveLength(6);
    expect(desabilitadas).toContain("Dragon's Hoard");
    expect(tg.names(0, 'hand')).toEqual(['Goldspan Dragon']);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    const lib = tg.state.zones.library[0].map((id) => tg.state.objects[id].def);
    expect(lib.slice(0, 10)).toEqual(forests);
    expect(lib.slice(10)).toHaveLength(6);
  });

  it('pode não revelar nada: as sete vão para o fundo', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], []], library: [['Goldspan Dragon', ...forests], forests] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith(N) ? { kind: 'select', ids: [] } : null));
    tg.activate(N, 'Sacrifique').resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.state.zones.library[0]).toHaveLength(11);
  });
});
