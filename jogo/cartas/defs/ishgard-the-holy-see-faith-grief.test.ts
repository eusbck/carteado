import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ishgard, the Holy See // Faith & Grief';

describe(N, () => {
  it('a aventura devolve até dois artefatos/encantamentos e depois o terreno é jogado do exílio', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Plains')], []], hand: [[N], []], graveyard: [['Basilisk Collar', 'Darksteel Plate', 'Opt'], []] });
    tg.choose('artefato', ['Basilisk Collar', 'Darksteel Plate']).cast(N, 'hand@1').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(expect.arrayContaining(['Basilisk Collar', 'Darksteel Plate']));
    expect(tg.find(N, 'exile')).not.toBeNull();
    const acao = tg.actionIds().find((a) => a.includes(String(tg.find(N, 'exile'))));
    expect(acao).toBeDefined();
  });
  it('como terreno, entra virado e gera {W}', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []] });
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
