import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Kess, Dissident Mage';
const terrenos = (n: number) => Array.from({ length: n }, (_, i) => ['Island', 'Swamp', 'Mountain'][i % 3]);

describe(N, () => {
  it('um feitiço do cemitério só no tempo de feitiço, pagando o custo; é exilado ao resolver', () => {
    // Preordain: feitiço {U}
    const tg = setup({ active: 1, battlefield: [[N, ...terrenos(3)], []], graveyard: [['Preordain', 'Elvish Mystic'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    // no turno do oponente, não
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.canCast('Preordain')).toBe(false);
    tg.passTo('main1', 0);
    // a criatura do cemitério não entra na permissão
    expect(tg.canCast('Elvish Mystic')).toBe(false);
    tg.cast('Preordain', '*').resolveAll();
    expect(tg.find('Preordain', 'exile')).not.toBeNull();
    expect(tg.find('Preordain', 'graveyard', 0)).toBeNull();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(1);
  });

  it('só uma vez em cada um dos seus turnos', () => {
    const tg = setup({ battlefield: [[N, ...terrenos(6)], []], graveyard: [['Preordain', 'Preordain'], []] });
    tg.cast('Preordain', '*').resolveAll();
    expect(tg.canCast('Preordain')).toBe(false);
    // no seu turno seguinte, de novo
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.canCast('Preordain')).toBe(true);
  });

  it('anulada, a mágica conjurada assim também é exilada', () => {
    const tg = setup({ battlefield: [[N, ...terrenos(3)], []], graveyard: [['Preordain'], []] });
    tg.cast('Preordain', '*');
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    tg.settle();
    expect(tg.find('Preordain', 'exile')).not.toBeNull();
  });

  it('conjurar pela retrospectiva não gasta a permissão de Kess', () => {
    // Sever the Bloodline tem retrospectiva {5}{B}{B}
    const tg = setup({ battlefield: [[N, ...Array(7).fill('Swamp'), 'Island'], ['Elvish Mystic']], graveyard: [['Sever the Bloodline', 'Preordain'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Sever the Bloodline', 'flashback').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.canCast('Preordain')).toBe(true);
  });

  it('com a recompra, a carta volta para a mão em vez de ser exilada', () => {
    // Evincar's Justice ({2}{B}{B}, recompra {3}) do cemitério por Kess
    const tg = setup({ battlefield: [[N, ...Array(7).fill('Swamp')], []], graveyard: [["Evincar's Justice"], []] });
    tg.choose('custo adicional opcional', ['Pagar: recompra {3}']).cast("Evincar's Justice", '*').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(["Evincar's Justice"]);
    expect(tg.state.zones.exile).toHaveLength(0);
  });
});
