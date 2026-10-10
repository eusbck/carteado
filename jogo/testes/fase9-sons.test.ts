// Fase 9, item 3.1: qual som de troca de turno toca em cada navegador ("seu turno" ou "turno de um
// adversário"), decidido pelo assento de cada um. A decisão é a função pura do cliente
// (cliente/src/somTurno.ts); aqui ela roda sobre as vistas de cada assento de uma partida de verdade
// do motor, com 4 jogadores e vários turnos.
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { RandomBot } from '../bots/aleatorio.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { Game } from '../motor/game.ts';
import type { DeckList } from '../motor/state.ts';
import type { GameConfig } from '../motor/types.ts';
import { buildView } from '../motor/view.ts';
import { somDaTroca, type SomTurno } from '../cliente/src/somTurno.ts';

const DECKS = decksJson as DeckList[];
const LIGADOS = { turnoMeu: true, turnoAdversario: true };

describe('som da troca de turno (função pura)', () => {
  it('nada na primeira vista (entrar ou reconectar) nem sem turno novo', () => {
    expect(somDaTroca(null, { number: 5, active: 0 }, 0, LIGADOS)).toBeNull();
    expect(somDaTroca({ number: 5, active: 0 }, { number: 5, active: 0 }, 0, LIGADOS)).toBeNull();
    // desfazer não volta turno, mas uma vista de turno anterior também não toca nada
    expect(somDaTroca({ number: 5, active: 0 }, { number: 4, active: 3 }, 0, LIGADOS)).toBeNull();
    // durante a mão inicial o turno é 0
    expect(somDaTroca({ number: 0, active: 0 }, { number: 0, active: 0 }, 0, LIGADOS)).toBeNull();
  });

  it('o primeiro turno da partida também avisa', () => {
    expect(somDaTroca({ number: 0, active: 2 }, { number: 1, active: 2 }, 2, LIGADOS)).toBe('meu');
    expect(somDaTroca({ number: 0, active: 2 }, { number: 1, active: 2 }, 0, LIGADOS)).toBe('adversario');
  });

  it('meu turno, turno de adversário e turno extra', () => {
    expect(somDaTroca({ number: 3, active: 2 }, { number: 4, active: 3 }, 3, LIGADOS)).toBe('meu');
    expect(somDaTroca({ number: 3, active: 2 }, { number: 4, active: 3 }, 1, LIGADOS)).toBe('adversario');
    // turno extra: o mesmo jogador de novo
    expect(somDaTroca({ number: 4, active: 3 }, { number: 5, active: 3 }, 3, LIGADOS)).toBe('meu');
    expect(somDaTroca({ number: 4, active: 3 }, { number: 5, active: 3 }, 0, LIGADOS)).toBe('adversario');
    // a vista pulou turnos (vários bots jogaram entre duas vistas): vale o turno que começou por último
    expect(somDaTroca({ number: 4, active: 3 }, { number: 7, active: 2 }, 2, LIGADOS)).toBe('meu');
    // quem só assiste ouve o de adversário
    expect(somDaTroca({ number: 4, active: 3 }, { number: 5, active: 0 }, null, LIGADOS)).toBe('adversario');
  });

  it('respeita cada chave das Configurações', () => {
    const soMeu = { turnoMeu: true, turnoAdversario: false };
    const soAdversario = { turnoMeu: false, turnoAdversario: true };
    const nenhum = { turnoMeu: false, turnoAdversario: false };
    const antes = { number: 1, active: 0 };
    expect(somDaTroca(antes, { number: 2, active: 1 }, 1, soMeu)).toBe('meu');
    expect(somDaTroca(antes, { number: 2, active: 1 }, 0, soMeu)).toBeNull();
    expect(somDaTroca(antes, { number: 2, active: 1 }, 1, soAdversario)).toBeNull();
    expect(somDaTroca(antes, { number: 2, active: 1 }, 0, soAdversario)).toBe('adversario');
    expect(somDaTroca(antes, { number: 2, active: 1 }, 1, nenhum)).toBeNull();
    expect(somDaTroca(antes, { number: 2, active: 1 }, 0, nenhum)).toBeNull();
  });
});

describe('preferências de som e música guardadas no navegador', () => {
  /** carrega cliente/src/preferencias.ts de novo, com o que estiver "guardado" */
  async function comGuardado(guardado: unknown) {
    const loja = new Map<string, string>(guardado === undefined ? [] : [['commander-da-mesa:preferencias', JSON.stringify(guardado)]]);
    vi.stubGlobal('localStorage', { getItem: (k: string) => loja.get(k) ?? null, setItem: (k: string, v: string) => { loja.set(k, v); } });
    vi.resetModules();
    const m = await import('../cliente/src/preferencias.ts');
    return { ...m, loja };
  }
  afterEach(() => { vi.unstubAllGlobals(); });

  it('padrão: os dois sons de turno, o do chat, o da abertura e os do combate (ataque e golpe) ligados; música ligada e baixa, com volume separado dos efeitos', async () => {
    const { preferencias } = await comGuardado(undefined);
    const p = preferencias();
    expect(p.sons).toEqual({ turnoMeu: true, turnoAdversario: true, dano: true, vida: true, chat: true, abertura: true, investida: true, impacto: true });
    expect(p.musica).toBe(true);
    expect(p.volumeMusica).toBeLessThanOrEqual(0.4);
    expect(p.volume).toBe(0.7);
  });

  it('quem tinha desligado o som de turno antigo fica com os dois desligados; o resto continua (os do chat, da abertura e do combate, que vieram depois, ligam)', async () => {
    const { preferencias } = await comGuardado({ volume: 0.5, sons: { turno: false, dano: true, vida: false } });
    const p = preferencias();
    expect(p.sons).toEqual({ turnoMeu: false, turnoAdversario: false, dano: true, vida: false, chat: true, abertura: true, investida: true, impacto: true });
    expect('turno' in p.sons).toBe(false);
    expect(p.volume).toBe(0.5);
  });

  it('modo Desempenho: desligado por padrão (também para quem já tinha preferências guardadas) e guardado quando liga', async () => {
    expect((await comGuardado(undefined)).preferencias().desempenho).toBe(false);
    const { preferencias, mudarPreferencias, loja } = await comGuardado({ volume: 0.5, musica: true });
    expect(preferencias().desempenho).toBe(false);
    mudarPreferencias({ desempenho: true });
    expect(JSON.parse(loja.get('commander-da-mesa:preferencias')!).desempenho).toBe(true);
    expect(preferencias().volume).toBe(0.5);
  });

  it('cada chave muda sozinha e fica guardada', async () => {
    const { preferencias, mudarPreferencias, loja } = await comGuardado({});
    mudarPreferencias({ sons: { ...preferencias().sons, turnoAdversario: false } });
    mudarPreferencias({ musica: false, volumeMusica: 0.15 });
    const guardado = JSON.parse(loja.get('commander-da-mesa:preferencias')!);
    expect(guardado.sons).toEqual({ turnoMeu: true, turnoAdversario: false, dano: true, vida: true, chat: true, abertura: true, investida: true, impacto: true });
    expect(guardado.musica).toBe(false);
    expect(guardado.volumeMusica).toBe(0.15);
    expect(guardado.volume).toBe(0.7);
  });
});

describe('som da troca de turno numa partida de 4 assentos', () => {
  /**
   * Joga uma partida de 4 bots aleatórios e, a cada `cada` respostas (o servidor manda vistas em
   * lotes), entrega a vista de cada assento ao "navegador" daquele assento, que decide o som como a
   * mesa faz. Devolve os sons de cada assento e os turnos que começaram entre duas vistas.
   */
  function partida(semente: string, cada: number, sons: (assento: number) => typeof LIGADOS = () => LIGADOS) {
    const nomes = ['Ana', 'Bruno', 'Caio', 'Dani'];
    const config: GameConfig = { seed: semente, players: nomes.map((name, i) => ({ name, deckId: DECKS[i].id })), startingLife: 40, turnLimit: null, multiplayer: true, manualMode: true, mulligan: 'londres' };
    const game = Game.create(config, DECKS.slice(0, 4));
    const bots = nomes.map((_, i) => new RandomBot(`${semente}:${i}`));
    const anterior = nomes.map((_, i) => buildView(game.g, i, game.pending).turn);
    const ouvidos: (SomTurno | null)[][] = nomes.map(() => []);
    const turnos: { number: number; active: number }[] = [];
    for (let k = 1; k < 60000 && game.pending && !game.isOver() && game.state.turn.number <= 12; k++) {
      const d = game.pending;
      if (!game.answer(d.player, bots[d.player].answer(d)).ok) game.answer(d.player, defaultAnswer(d));
      if (k % cada) continue;
      const vistas = nomes.map((_, i) => buildView(game.g, i, game.pending));
      if (vistas[0].turn.number > anterior[0].number) turnos.push({ number: vistas[0].turn.number, active: vistas[0].turn.active });
      for (const [i, v] of vistas.entries()) {
        const som = somDaTroca(anterior[i], v.turn, i, sons(i));
        if (som || v.turn.number !== anterior[i].number) ouvidos[i].push(som);
        anterior[i] = v.turn;
      }
    }
    return { ouvidos, turnos };
  }

  it('a cada turno novo, só o jogador do turno ouve "seu turno"; os outros três ouvem o de adversário', () => {
    const { ouvidos, turnos } = partida('fase9-sons-4p', 1);
    expect(turnos.length).toBeGreaterThanOrEqual(8);
    // os turnos andam um a um, a partir do 1, e passam pelos quatro assentos
    expect(turnos.map((t) => t.number)).toEqual(turnos.map((_, i) => i + 1));
    expect(new Set(turnos.map((t) => t.active)).size).toBe(4);
    for (let assento = 0; assento < 4; assento++) {
      expect(ouvidos[assento]).toEqual(turnos.map((t) => (t.active === assento ? 'meu' : 'adversario')));
      expect(ouvidos[assento].filter((s) => s === 'meu').length).toBe(turnos.filter((t) => t.active === assento).length);
    }
    // em cada troca, exatamente um "seu turno" na mesa inteira
    for (let k = 0; k < turnos.length; k++) expect(ouvidos.filter((o) => o[k] === 'meu').length).toBe(1);
  });

  it('com vistas em lotes (vários turnos de bots entre duas vistas) cada um ouve o som do turno em que a vista chegou', () => {
    const { ouvidos, turnos } = partida('fase9-sons-4p', 97);
    expect(turnos.length).toBeGreaterThanOrEqual(4);
    for (let assento = 0; assento < 4; assento++) {
      expect(ouvidos[assento]).toEqual(turnos.map((t) => (t.active === assento ? 'meu' : 'adversario')));
    }
  });

  it('cada assento com as próprias Configurações', () => {
    // Ana: os dois; Bruno: só o próprio turno; Caio: só os dos adversários; Dani: nenhum
    const prefs = [LIGADOS, { turnoMeu: true, turnoAdversario: false }, { turnoMeu: false, turnoAdversario: true }, { turnoMeu: false, turnoAdversario: false }];
    const { ouvidos, turnos } = partida('fase9-sons-4p', 1, (i) => prefs[i]);
    const esperado = (assento: number) => turnos.map((t) => {
      const som: SomTurno = t.active === assento ? 'meu' : 'adversario';
      return (som === 'meu' ? prefs[assento].turnoMeu : prefs[assento].turnoAdversario) ? som : null;
    });
    for (let assento = 0; assento < 4; assento++) expect(ouvidos[assento]).toEqual(esperado(assento));
    expect(ouvidos[1].every((s) => s !== 'adversario')).toBe(true);
    expect(ouvidos[2].every((s) => s !== 'meu')).toBe(true);
    expect(ouvidos[3].every((s) => s === null)).toBe(true);
  });
});
