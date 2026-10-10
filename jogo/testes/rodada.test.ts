// Rodada (09/10): a mesa conta rodadas (todos os jogadores tiveram a vez), enquanto as regras continuam contando o
// turno de cada jogador (CR 500.1). O testador achava que os turnos andavam rápido demais: em 4 jogadores o número
// subia 4 vezes por rodada.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import { buildView } from '../motor/view.ts';
import { setup } from './harness.ts';

const ILHAS = Array.from({ length: 12 }, () => 'Island');
const vez = (tg: ReturnType<typeof setup>) => ({ ativo: tg.state.turn.active, turno: tg.state.turn.number, rodada: buildView(tg.g, 0, tg.pending).turn.round });

describe('rodada', () => {
  it('4 jogadores: a rodada sobe quando a vez volta para o primeiro; o turno sobe a cada vez', () => {
    const tg = setup({ players: 4, battlefield: [[], [], [], []], library: [ILHAS, ILHAS, ILHAS, ILHAS] });
    tg.state.turn.round = 1;
    const t0 = tg.state.turn.number;
    expect(vez(tg)).toEqual({ ativo: 0, turno: t0, rodada: 1 });
    tg.passTo('upkeep', 1);
    expect(vez(tg)).toEqual({ ativo: 1, turno: t0 + 1, rodada: 1 });
    tg.passTo('upkeep', 2);
    tg.passTo('upkeep', 3);
    expect(vez(tg)).toEqual({ ativo: 3, turno: t0 + 3, rodada: 1 });
    tg.passTo('upkeep', 0);
    expect(vez(tg)).toEqual({ ativo: 0, turno: t0 + 4, rodada: 2 });
    // o registro leva a rodada de cada linha
    expect(tg.state.log[tg.state.log.length - 1].round ?? buildView(tg.g, 0, tg.pending).log.at(-1)?.round).toBe(2);
  });

  it('com um jogador fora da partida, a rodada continua certa (ele é pulado)', () => {
    const tg = setup({ players: 4, battlefield: [[], [], [], []], library: [ILHAS, ILHAS, ILHAS, ILHAS] });
    tg.state.turn.round = 1;
    tg.passTo('upkeep', 1);
    tg.game.concede(2);
    tg.passTo('upkeep', 3);
    expect(vez(tg).rodada).toBe(1);
    tg.passTo('upkeep', 0);
    expect(vez(tg).rodada).toBe(2);
    tg.passTo('upkeep', 1);
    tg.passTo('upkeep', 3);
    expect(vez(tg).rodada).toBe(2);
    tg.passTo('upkeep', 0);
    expect(vez(tg).rodada).toBe(3);
  });

  it('estado salvo antes da rodada (sem o campo): a vista estima pelo número do turno', () => {
    const tg = setup({ players: 4, battlefield: [[], [], [], []], library: [ILHAS, ILHAS, ILHAS, ILHAS] });
    delete tg.state.turn.round;
    tg.state.turn.number = 9;
    expect(buildView(tg.g, 0, tg.pending).turn.round).toBe(3);
  });
});
