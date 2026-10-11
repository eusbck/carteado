import { describe, expect, it } from 'vitest';
import { extraLandThisTurn } from '../../motor/criaturas.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Explore';
const podeJogarTerreno = (tg: ReturnType<typeof setup>) => tg.actionIds().some((a) => a.startsWith('play:'));

describe(N, () => {
  it('você pode jogar um terreno adicional neste turno e compra uma carta', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N, 'Island', 'Swamp', 'Plains'], []], library: [Array(6).fill('Mountain'), Array(6).fill('Mountain')] });
    tg.play('Island');
    expect(podeJogarTerreno(tg)).toBe(false);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toContain('Mountain');
    expect(podeJogarTerreno(tg)).toBe(true);
    tg.play('Swamp');
    expect(podeJogarTerreno(tg)).toBe(false);
    // no turno seguinte volta a ser um terreno por turno
    tg.passTo('upkeep', 1).passTo('main1', 0);
    tg.play('Plains');
    expect(podeJogarTerreno(tg)).toBe(false);
  });

  it('dois Explores no mesmo turno deixam jogar três terrenos', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N, N, 'Island', 'Swamp', 'Plains'], []], library: [Array(6).fill('Mountain'), Array(6).fill('Mountain')] });
    tg.cast(N).resolveAll();
    tg.cast(N).resolveAll();
    tg.play('Island');
    tg.play('Swamp');
    tg.play('Plains');
    expect(tg.state.turn.landsPlayed).toBe(3);
    // o quarto terreno (uma Mountain comprada) não pode
    expect(podeJogarTerreno(tg)).toBe(false);
  });

  it('CR 305.2: a permissão de terreno adicional só vale para o jogador ativo', () => {
    const tg = setup({ active: 1, battlefield: [[], []] });
    extraLandThisTurn(tg.g, 0);
    expect(tg.state.turn.extraLands ?? 0).toBe(0);
    extraLandThisTurn(tg.g, 1);
    expect(tg.state.turn.extraLands).toBe(1);
  });
});