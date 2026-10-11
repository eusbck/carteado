import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Dark Impostor';

describe(N, () => {
  it('ganha as habilidades ativadas da criatura exilada, não as desencadeadas nem as estáticas', () => {
    // Nirkana Revenant: "{B}: +1/+1 até o fim do turno" (ativada) e o gatilho dos Swamps (não vem)
    const tg = setup({ battlefield: [[N, ...Array(8).fill('Swamp')], ['Nirkana Revenant']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    tg.choose('criatura alvo', ['Nirkana Revenant']).activate(N, '{4}{B}{B}').resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Nirkana Revenant']);
    expect(tg.pt(id)).toEqual([3, 3]);
    tg.activate(N, '{B}: Esta criatura recebe').resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
    // a mana a mais por Swamp não veio junto: a Swamp que sobrou dá um {B} só
    expect(tg.state.players[0].manaPool).toHaveLength(0);
  });
});
