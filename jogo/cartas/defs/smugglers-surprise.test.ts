import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/api.ts';

const SS = "Smuggler's Surprise";
const M1 = '+ {2} — Moa quatro cartas';
const M2 = '+ {4}{G} — Você pode colocar';
const M3 = '+ {1} — As criaturas com força 4';
const virados = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length;

describe(SS, () => {
  it('cada modo escolhido soma o seu custo', () => {
    // só o primeiro: {G} + {2}
    const tg = setup({ battlefield: [[...Array(9).fill('Forest')], []], hand: [[SS], []], library: [['Island', 'Elvish Mystic', 'Sol Ring', 'Plains', 'Swamp'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('modo') ? { kind: 'select', ids: [d.items.find((i) => i.label.startsWith(M1))!.id] } : null));
    tg.choose('moídas para a sua mão', ['Island', 'Elvish Mystic']).cast(SS);
    expect(virados(tg)).toBe(3);
    tg.resolve();
    // Sol Ring não é criatura nem terreno
    expect(tg.names(0, 'hand').sort()).toEqual(['Elvish Mystic', 'Island']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Plains', SS, 'Sol Ring'].sort());
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
  });

  it('os três modos: as criaturas postas no campo pelo segundo também ficam protegidas', () => {
    // {G} + {2} + {4}{G} + {1} = 9
    const tg = setup({
      battlefield: [[...Array(9).fill('Forest'), 'Indomitable Ancients'], []], hand: [[SS, 'Zetalpa, Primal Dawn'], []],
      library: [['Island', 'Plains', 'Swamp', 'Mountain'], []],
    });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('modo') ? { kind: 'select', ids: d.items.filter((i) => [M1, M2, M3].some((m) => i.label.startsWith(m))).map((i) => i.id) } : null));
    tg.choose('moídas para a sua mão', []).choose('da sua mão para o campo', ['Zetalpa, Primal Dawn']).cast(SS);
    expect(virados(tg)).toBe(9);
    tg.resolve();
    const z = tg.bf('Zetalpa, Primal Dawn');
    expect(hasKw(tg.g, z, 'hexproof')).toBe(true);
    // Indomitable Ancients (força 2) não
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'hexproof')).toBe(false);
  });
});
