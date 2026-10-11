import { describe, expect, it } from 'vitest';
import { controllerOf, tap } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Mob Rule';
const lib = Array(8).fill('Swamp');
const campo = (): [string[], string[]] => [[...Array(6).fill('Mountain'), 'Elvish Mystic'], ['Silver Myr', 'Crimson Honor Guard', 'Butcher of Malakir']];

describe(N, () => {
  it('força 4 ou mais: rouba, desvira e dá ímpeto às criaturas grandes, até o fim do turno', () => {
    const tg = setup({ battlefield: campo(), hand: [[N], []], library: [lib, lib] });
    const guarda = tg.bf('Crimson Honor Guard');
    tap(tg.g, guarda);
    tg.choose('modo', ['Ganhe o controle de todas as criaturas com força 4 ou mais até o fim do turno. Desvire essas criaturas. Elas ganham ímpeto até o fim do turno']).cast(N).resolveAll();
    expect(controllerOf(tg.g, guarda)).toBe(0);
    expect(controllerOf(tg.g, tg.find('Butcher of Malakir')!)).toBe(0);
    expect(controllerOf(tg.g, tg.find('Silver Myr')!)).toBe(1);
    expect(tg.state.objects[guarda].tapped).toBe(false);
    expect(hasKw(tg.g, guarda, 'haste')).toBe(true);
    tg.passTo('main1', 1);
    expect(controllerOf(tg.g, guarda)).toBe(1);
  });

  it('força 3 ou menos: rouba, desvira e dá ímpeto às criaturas pequenas, inclusive as suas', () => {
    const tg = setup({ battlefield: campo(), hand: [[N], []], library: [lib, lib] });
    const elfo = tg.find('Elvish Mystic')!;
    tap(tg.g, elfo);
    tg.choose('modo', ['Ganhe o controle de todas as criaturas com força 3 ou menos até o fim do turno. Desvire essas criaturas. Elas ganham ímpeto até o fim do turno']).cast(N).resolveAll();
    expect(controllerOf(tg.g, tg.find('Silver Myr')!)).toBe(0);
    expect(controllerOf(tg.g, tg.find('Crimson Honor Guard')!)).toBe(1);
    expect(tg.state.objects[elfo].tapped).toBe(false);
    expect(hasKw(tg.g, elfo, 'haste')).toBe(true);
  });
});
