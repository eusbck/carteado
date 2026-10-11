import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Falkenrath Gorger';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('o Vampire descartado vai para o exílio e pode ser conjurado pelo próprio custo de mana', () => {
    // Vampire Nighthawk custa {1}{B}{B}
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Vampire Nighthawk'], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
    tg.yes('loucura', true);
    runEffect(tg, discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find('Vampire Nighthawk')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Swamp' && tg.state.objects[id].tapped)).toHaveLength(3);
  });

  it('sem Falkenrath Gorger no campo, ou com carta que não é Vampire, o descarte vai direto para o cemitério', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []], library: [lib, lib] });
    runEffect(tg, discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
    const sem = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [['Vampire Nighthawk'], []], library: [lib, lib] });
    runEffect(sem, discard(sem.g, 0, 1));
    sem.resolveAll();
    expect(sem.names(0, 'graveyard')).toEqual(['Vampire Nighthawk']);
  });
});
