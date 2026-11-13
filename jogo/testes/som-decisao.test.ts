// O som de decisão (cliente/src/somDecisao.ts): a buzina toca quando outro jogador jogou e agora a decisão é sua, e
// fica quieta enquanto você mesmo joga (baixar e virar terrenos, lançar, as perguntas seguidas da sua jogada).
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { RandomBot } from '../bots/aleatorio.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { shouldAutoPass } from '../motor/autopass.ts';
import { Game } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import type { GameConfig } from '../motor/types.ts';
import { buildView } from '../motor/view.ts';
import { PARADAS_PADRAO } from '../servidor/salas.ts';
import { INTERVALO_MINIMO, JOGADAS, buzinaNaChegada, estadoBuzinaNovo, type LinhaChegando } from '../cliente/src/somDecisao.ts';

const DECKS = decksJson as DeckList[];

/** uma sequência de vistas para o assento 0: [decisão, linhas novas] */
function rodar(passos: [number | null, LinhaChegando[]][], agoraPasso = 2000) {
  const e = estadoBuzinaNovo();
  const log: LinhaChegando[] = [];
  return passos.map(([decisao, novas], i) => {
    log.push(...novas);
    return buzinaNaChegada(e, { agora: i * agoraPasso, eu: 0, decisao, log: [...log], ligado: true });
  });
}

describe('buzina da decisão (função pura)', () => {
  it('entrar na partida com uma decisão já aberta não buzina', () => {
    expect(rodar([[1, [{ seq: 0, kind: 'turno', actor: 1 }]]])).toEqual([false]);
  });

  it('suas jogadas seguidas não buzinam; outro jogar e a decisão voltar a você buzina', () => {
    expect(rodar([
      [1, [{ seq: 0, kind: 'turno', actor: 0 }]],
      [2, [{ seq: 1, kind: 'terreno', actor: 0 }]], // baixou terreno
      [3, [{ seq: 2, kind: 'ativa', actor: 0 }]], // virou terreno para mana
      [4, [{ seq: 3, kind: 'conjura', actor: 0 }]], // lançou
      [5, [{ seq: 4, kind: 'resolve', actor: 0 }, { seq: 5, kind: 'gatilho', actor: 2 }]], // resolveu; gatilho de outro não conta
      [null, [{ seq: 6, kind: 'turno', actor: 1 }]], // turno do outro
      [null, [{ seq: 7, kind: 'conjura', actor: 1 }]],
      [6, []], // agora sou eu
      [7, [{ seq: 8, kind: 'conjura', actor: 0 }]], // eu respondo e sigo
    ])).toEqual([false, false, false, false, false, false, false, true, false]);
  });

  it('a mesma decisão não buzina de novo; chave desligada e espectador não buzinam', () => {
    expect(rodar([[1, []], [null, [{ seq: 0, kind: 'conjura', actor: 1 }]], [2, []], [2, []]])).toEqual([false, false, true, false]);
    const e = estadoBuzinaNovo();
    buzinaNaChegada(e, { agora: 0, eu: null, decisao: null, log: [], ligado: true });
    expect(buzinaNaChegada(e, { agora: 5000, eu: null, decisao: 1, log: [{ seq: 0, kind: 'conjura', actor: 1 }], ligado: true })).toBe(false);
    const f = estadoBuzinaNovo();
    buzinaNaChegada(f, { agora: 0, eu: 0, decisao: null, log: [], ligado: false });
    expect(buzinaNaChegada(f, { agora: 5000, eu: 0, decisao: 1, log: [{ seq: 0, kind: 'conjura', actor: 1 }], ligado: false })).toBe(false);
  });

  it('não sobrepõe duas buzinas coladas', () => {
    expect(rodar([[1, []], [null, [{ seq: 0, kind: 'conjura', actor: 1 }]], [2, []], [null, [{ seq: 1, kind: 'conjura', actor: 2 }]], [3, []]], INTERVALO_MINIMO / 4))
      .toEqual([false, false, true, false, false]);
  });
});

describe('buzina numa partida de verdade (4 jogadores, paradas padrão no assento 0)', () => {
  it('nunca buzina numa decisão sua sem jogada de outro desde a anterior, e buzina quando a vez volta', () => {
    const nomes = ['Ana', 'Bruno', 'Caio', 'Dani'];
    const config: GameConfig = { seed: 'buzina-4p', players: nomes.map((name, i) => ({ name, deckId: DECKS[i].id })), startingLife: 40, turnLimit: null, multiplayer: true, manualMode: true, mulligan: 'londres' };
    const game = Game.create(config, DECKS.slice(0, 4));
    const bots = nomes.map((_, i) => new RandomBot(`buzina:${i}`));
    const e = estadoBuzinaNovo();
    let agora = 0, decisoes = 0, buzinas = 0, buzinasNoMeuTurno = 0, ultimaSeqMinha = -1;
    for (let k = 0; k < 60000 && game.pending && !game.isOver() && game.state.turn.number <= 16; k++) {
      const d = game.pending;
      // o assento 0 é a pessoa: as paradas automáticas do servidor passam sozinhas, como na mesa
      const auto = d.player === 0 && shouldAutoPass(game.state, d, 0, PARADAS_PADRAO);
      if (d.player === 0 && !auto) {
        const v = buildView(game.g, 0, game.pending);
        agora += 3000;
        const tocou = buzinaNaChegada(e, { agora, eu: 0, decisao: v.decision?.id ?? null, log: v.log, ligado: true });
        decisoes++;
        if (tocou) {
          buzinas++;
          if (v.turn.active === 0) buzinasNoMeuTurno++;
          const novas = v.log.filter((l) => l.seq > ultimaSeqMinha);
          expect(novas.some((l) => l.actor != null && l.actor !== 0 && l.kind && JOGADAS.has(l.kind))).toBe(true);
        }
        ultimaSeqMinha = Math.max(ultimaSeqMinha, ...v.log.map((l) => l.seq));
      }
      const r = auto ? { kind: 'priority' as const, action: 'pass' as const } : bots[d.player].answer(d);
      if (!game.answer(d.player, r).ok) game.answer(d.player, defaultAnswer(d));
    }
    expect(buzinas).toBeGreaterThan(0);
    expect(buzinas).toBeLessThan(decisoes / 2);
  });
});
