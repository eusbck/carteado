import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Borg Scout Sphere';

describe(N, () => {
  it('ao entrar compra uma carta; com 6 marcadores de carga as criaturas artefato suas voam', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Zetalpa, Primal Dawn', 'Steel Overseer', 'Solemn Simulacrum'], []], hand: [[N], []] });
    const mao = tg.names(0, 'hand').length;
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand').length).toBe(mao); // saiu a Esfera, entrou a carta comprada
    tg.choose('Vire 1', ['Zetalpa, Primal Dawn']).activate(N, 'Estação').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.charge).toBe(4);
    expect(hasKw(tg.g, tg.bf('Steel Overseer'), 'flying')).toBe(false);
    tg.choose('Vire 1', ['Solemn Simulacrum']).activate(N, 'Estação').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.charge).toBe(6);
    expect(hasKw(tg.g, tg.bf('Steel Overseer'), 'flying')).toBe(true);
    // CR 721.2b: vira uma criatura artefato 5/5, que também voa
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
  });
});
