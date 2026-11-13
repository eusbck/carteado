// F2: vazamentos da cena (R7 do estudo do Arena, eventos 3.2). Para cada assento, os eventos redigidos que vão com uma
// vista não têm id que ele não veja na vista anterior nem na seguinte (a não ser objeto público que nasceu e sumiu
// entre as duas), nem id de grimório, nem `def`/`card`. Partida de 4 com bots (todos os assentos espiados), cenas
// roteirizadas (busca, compra do adversário, carta virada para baixo) e a sala no servidor (cursor, época, salto).
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { HeuristicBot } from '../bots/heuristico.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { DEFAULT_STOPS } from '../motor/autopass.ts';
import { diarioDesde } from '../motor/diario.ts';
import { Game } from '../motor/game.ts';
import type { G } from '../motor/game-context.ts';
import type { DeckList } from '../motor/state.ts';
import type { Decision, PlayerId } from '../motor/types.ts';
import { buildView, canSee, type GameView } from '../motor/view.ts';
import { Banco } from '../servidor/banco.ts';
import { eventosPara } from '../servidor/cena.ts';
import type { EventoCena, MsgCliente, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';
import { setup, type TestGame } from './harness.ts';

const DECKS = decksJson as DeckList[];

/** os ids de objeto citados nos eventos */
function idsDaCena(x: unknown): number[] {
  const out: number[] = [];
  const andar = (v: unknown, k: string) => {
    if (typeof v === 'number' && (k === 'id' || k === 'fonte' || k === 'a')) out.push(v);
    else if (Array.isArray(v)) v.forEach((y) => andar(y, k === 'ids' || k === 'bloqueios' ? 'id' : k));
    else if (v && typeof v === 'object') for (const [kk, vv] of Object.entries(v)) andar(vv, kk);
  };
  andar(x, '');
  return out;
}

/** os ids de objeto que a vista mostra */
function idsDaVista(v: GameView): Set<number> {
  const s = new Set<number>();
  for (const o of [...v.battlefield, ...v.exile, ...v.command, ...v.hand, ...v.players.flatMap((p) => [...p.graveyard, ...(p.topCard ? [p.topCard] : [])])]) s.add(o.id);
  for (const st of v.stack) { s.add(st.id); if (st.source !== undefined) s.add(st.source); }
  return s;
}

const noGrimorio = (g: G) => new Set(g.state.zones.library.flat());

interface Foto { vista: GameView; grimorio: Set<number> }
const foto = (g: G, assento: PlayerId): Foto => ({ vista: buildView(g, assento, null), grimorio: noGrimorio(g) });

/** confere uma cena de um assento entre a foto anterior (v1) e a seguinte (v2, tirada agora) */
function conferir(g: G, assento: PlayerId, eventos: EventoCena[], v1: Foto, v2: Foto, ctx: string): void {
  const json = JSON.stringify(eventos);
  expect(json, ctx).not.toMatch(/"(def|card|cause|abilityId|name)"/);
  const vistos = new Set([...idsDaVista(v1.vista), ...idsDaVista(v2.vista)]);
  for (const id of idsDaCena(eventos)) {
    // R4: id de objeto no grimório nunca (nem antes nem depois)
    expect(v1.grimorio.has(id) || v2.grimorio.has(id), `${ctx}: id ${id} de grimório`).toBe(false);
    if (vistos.has(id)) continue;
    // objeto que nasceu e sumiu entre as duas vistas: só se era público para o assento (nunca uma carta na mão alheia)
    const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
    expect(o, `${ctx}: id ${id} desconhecido`).toBeTruthy();
    expect(o!.zone, `${ctx}: id ${id}`).not.toBe('library');
    expect(canSee(g, o!, assento), `${ctx}: id ${id} (${o!.zone}) que o assento ${assento} não via`).toBe(true);
  }
  // R3: a compra de outro jogador vai sem id
  for (const e of eventos) {
    if (e.tipo === 'comprar' && e.jogador !== assento) expect(e, ctx).not.toHaveProperty('id');
    if (e.tipo === 'zona' && e.de.zona === 'library') expect(e.de, ctx).not.toHaveProperty('id');
    if (e.tipo === 'zona' && e.para.zona === 'library') expect(e.para, ctx).not.toHaveProperty('id');
    if (e.tipo === 'zona' && e.para.zona === 'hand' && e.para.dono !== assento) expect(e.para, ctx).not.toHaveProperty('id');
  }
}

/** espia todos os assentos de uma partida: cada `vista()` redige o que veio desde a anterior e confere */
class Espiao {
  cursor: number;
  fotos: Foto[];
  cenas: EventoCena[][];
  constructor(readonly g: G, readonly n: number) {
    this.cursor = g.diario!.prox - 1;
    this.fotos = Array.from({ length: n }, (_, a) => foto(g, a));
    this.cenas = Array.from({ length: n }, () => []);
  }
  vista(ctx = ''): EventoCena[][] {
    const { entradas, salto } = diarioDesde(this.g.diario!, this.cursor);
    expect(salto).toBe(false);
    const out: EventoCena[][] = [];
    for (let a = 0; a < this.n; a++) {
      const eventos = eventosPara(a, entradas);
      const v2 = foto(this.g, a);
      conferir(this.g, a, eventos, this.fotos[a], v2, `${ctx} assento ${a}`);
      this.fotos[a] = v2;
      this.cenas[a].push(...eventos);
      out.push(eventos);
    }
    if (entradas.length) this.cursor = entradas[entradas.length - 1].seq;
    return out;
  }
}

describe('cena: vazamentos numa partida de 4 com bots', () => {
  it('nenhum assento recebe id que não via, id de grimório nem def', () => {
    const decks = DECKS.slice(0, 4);
    const game = Game.create({ seed: 'cena-espiao', players: decks.map((d, i) => ({ name: `J${i}`, deckId: d.id })), startingLife: 40, turnLimit: 8, multiplayer: true }, decks);
    game.ligarDiario();
    const bots = [0, 1, 2, 3].map((p) => new HeuristicBot(`c${p}`, p, { nivel: 'intermediario', simulacoes: 2 }));
    const esp = new Espiao(game.g, 4);
    let passos = 0;
    for (; passos < 900 && game.pending && !game.isOver() && game.state.turn.number <= 6; passos++) {
      const d = game.pending;
      expect(game.answer(d.player, bots[d.player].answer(d, game)).ok).toBe(true);
      // uma vista a cada poucas decisões, como o servidor (entre duas vistas acontecem vários lotes)
      if (passos % 3 === 0) esp.vista(`passo ${passos}`);
    }
    esp.vista('fim');
    expect(game.state.turn.number).toBeGreaterThan(3);
    // a partida teve o que conferir: compras de todos, trocas de zona, passos
    for (let a = 0; a < 4; a++) {
      const tipos = new Set(esp.cenas[a].map((e) => e.tipo));
      for (const t of ['passo', 'comprar', 'zona', 'virar']) expect(tipos, `assento ${a}`).toContain(t);
      expect(esp.cenas[a].some((e) => e.tipo === 'comprar' && e.jogador !== a)).toBe(true);
      expect(esp.cenas[a].some((e) => e.tipo === 'comprar' && e.jogador === a && e.id !== undefined)).toBe(true);
    }
  }, 180000);
});

/** harness de 4 com o diário ligado desde o começo */
function mesa(o: Parameters<typeof setup>[0]): { tg: TestGame; esp: Espiao } {
  const tg = setup({ players: 4, ...o, onStart: (t) => t.game.ligarDiario() });
  return { tg, esp: new Espiao(tg.g, 4) };
}

describe('cena: vazamentos roteirizados', () => {
  it('busca no grimório: os outros sabem que procurou e que uma carta foi para a mão, sem ids', () => {
    const { tg, esp } = mesa({ battlefield: [['Swamp', 'Swamp'], [], [], []], hand: [['Demonic Tutor'], [], [], []], library: [['Island', 'Sol Ring', 'Plains'], ['Forest'], ['Forest'], ['Forest']] });
    tg.choose('procure uma carta', ['Sol Ring']).cast('Demonic Tutor').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    const cenas = esp.vista('tutor');
    const sol = tg.find('Sol Ring', 'hand', 0)!;
    for (let a = 1; a < 4; a++) {
      expect(cenas[a].some((e) => e.tipo === 'buscar' && e.jogador === 0 && e.grimorio === 0)).toBe(true);
      const paraMao = cenas[a].find((e) => e.tipo === 'zona' && e.de.zona === 'library' && e.para.zona === 'hand');
      expect(paraMao, `assento ${a}`).toMatchObject({ de: { zona: 'library', dono: 0 }, para: { zona: 'hand', dono: 0 } });
      expect(idsDaCena(paraMao)).toEqual([]);
      expect(idsDaCena(cenas[a])).not.toContain(sol);
    }
    // quem buscou recebe o id da carta na mão (não o do grimório)
    expect(cenas[0].find((e) => e.tipo === 'zona' && e.de.zona === 'library')).toMatchObject({ para: { id: sol, zona: 'hand' } });
  });

  it('compra do adversário vira contagem; a de quem compra leva o id da mão', () => {
    const { tg, esp } = mesa({ step: 'end', library: [['Island'], ['Forest', 'Forest'], ['Forest'], ['Forest']] });
    tg.passTo('main1', 1);
    const cenas = esp.vista('compra');
    const comprada = tg.state.zones.hand[1][0];
    expect(cenas[1].find((e) => e.tipo === 'comprar')).toMatchObject({ jogador: 1, id: comprada });
    for (const a of [0, 2, 3]) {
      const c = cenas[a].find((e) => e.tipo === 'comprar')!;
      expect(c).toMatchObject({ tipo: 'comprar', jogador: 1 });
      expect(c).not.toHaveProperty('id');
      expect(idsDaCena(cenas[a])).not.toContain(comprada);
    }
  });

  it('carta manifestada (virada para baixo): o grimório não sai, e só quem a controla recebe o id dela', () => {
    const N = 'Orochi Soul-Reaver';
    const ilhas = Array(8).fill('Island');
    const { tg, esp } = mesa({ battlefield: [[N], [], [], []], library: [ilhas, ['Baleful Strix', ...ilhas], ilhas, ilhas] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    const manifestada = tg.state.zones.battlefield.find((id) => tg.state.objects[id].faceDown)!;
    expect(manifestada).toBeDefined();
    const cenas = esp.vista('manifestar');
    const entrou = (a: number) => cenas[a].find((e) => e.tipo === 'zona' && e.de.zona === 'library' && e.para.zona === 'battlefield');
    expect(entrou(0)).toMatchObject({ de: { zona: 'library', dono: 1 }, para: { id: manifestada } });
    for (const a of [1, 2, 3]) {
      expect(entrou(a), `assento ${a}`).toBeDefined();
      expect(idsDaCena(entrou(a))).toEqual([]);
      expect(JSON.stringify(cenas[a])).not.toContain('Strix');
    }
  });
});

// ------------------------------------------------------------------ na sala do servidor

class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
  jogos(): Extract<MsgServidor, { t: 'jogo' }>[] { return this.msgs.filter((m): m is Extract<MsgServidor, { t: 'jogo' }> => m.t === 'jogo'); }
}

const espera = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const resposta = (d: Decision): MsgCliente => ({ t: 'responder', decisao: d.id, resposta: d.kind === 'payment' ? { kind: 'payment', auto: true } : defaultAnswer(d) });

describe('cena: na sala', () => {
  it('a conexão começa no fim; as cenas encadeiam (de = ate anterior); desfazer muda a época; reconectar começa no fim', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    g.sementeFixa = 'cena-sala';
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '4p' });
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    for (let i = 1; i < 4; i++) g.tratar(ana, { t: 'bot', assento: i, deck: DECKS[i].id });
    g.tratar(ana, { t: 'paradas', paradas: { ...DEFAULT_STOPS, skipWhenNothing: false } });
    g.tratar(ana, { t: 'iniciar' });
    // Ana responde o padrão até o turno 6 e joga um terreno quando der (para ter o que desfazer)
    let jogou = false;
    for (let k = 0; k < 2000 && !jogou; k++) {
      await espera();
      const v = ana.ultima('jogo')?.vista;
      const d = v?.decision;
      if (!d) { await espera(2); continue; }
      const terreno = d.kind === 'priority' && v.turn.number >= 6 && v.turn.active === 0 ? d.actions.find((a) => a.kind === 'play') : undefined;
      if (terreno) { g.tratar(ana, { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: terreno.id } }); jogou = true; }
      else g.tratar(ana, resposta(d));
    }
    expect(jogou).toBe(true);
    await espera();
    const jogos = ana.jogos();
    expect(jogos.length).toBeGreaterThan(5);
    const sala = g.salas.get(ana.ultima('sala')!.sala.codigo)!;
    expect(sala.game!.g.diario).not.toBeNull();
    // a primeira: sem passado
    expect(jogos[0].cena).toMatchObject({ eventos: [] });
    expect(jogos[0].cena!.de).toBe(jogos[0].cena!.ate);
    // encadeadas, na mesma época, com o seq crescente; a vista anterior e a seguinte cobrem os ids
    let vistos = 0;
    for (let k = 1; k < jogos.length; k++) {
      const [a, b] = [jogos[k - 1], jogos[k]];
      const cena = b.cena!;
      if (b.reinicio) continue;
      expect(cena.epoca).toBe(a.cena!.epoca);
      expect(cena.de, `vista ${k}`).toBe(a.cena!.ate);
      if (cena.salto) { expect(cena.eventos).toEqual([]); continue; }
      const seqs = cena.eventos.map((e) => e.seq);
      expect(seqs).toEqual([...seqs].sort((x, y) => x - y));
      for (const s of seqs) { expect(s).toBeGreaterThan(cena.de); expect(s).toBeLessThanOrEqual(cena.ate); }
      expect(JSON.stringify(cena)).not.toMatch(/"(def|card|cause|abilityId)"/);
      const ids = new Set([...idsDaVista(a.vista), ...idsDaVista(b.vista)]);
      for (const id of idsDaCena(cena.eventos)) {
        if (ids.has(id)) continue;
        const o = sala.game!.g.state.objects[id] ?? sala.game!.g.state.lki[id]?.obj;
        expect(o && o.zone !== 'library' && canSee(sala.game!.g, o, 0), `vista ${k}: id ${id}`).toBe(true);
      }
      vistos += cena.eventos.length;
    }
    expect(vistos).toBeGreaterThan(20);
    // sem reenvio sem fim: transmitir de novo sem nada novo não manda outra vista
    const n = ana.jogos().length;
    sala.transmitir();
    sala.transmitir();
    expect(ana.jogos().length).toBe(n);
    // eventos demais desde a última vista: salto, sem eventos, e o cursor vai ao fim (a seguinte não repete o salto)
    const d = sala.game!.g.diario!;
    const passo = (): void => { d.entradas.push({ seq: d.prox++, lote: d.lote++, turno: 1, etapa: 'main1', ev: { type: 'step', step: 'main1', active: 0 }, vis: {} }); };
    for (let k = 0; k < 70; k++) passo();
    sala.transmitir();
    const salto = ana.ultima('jogo')!;
    expect(ana.jogos().length).toBe(n + 1);
    expect(salto.cena).toMatchObject({ salto: true, eventos: [], ate: d.prox - 1 });
    passo();
    sala.transmitir();
    expect(ana.ultima('jogo')!.cena).toMatchObject({ eventos: [{ tipo: 'passo' }], de: salto.cena!.ate });
    expect(ana.ultima('jogo')!.cena).not.toHaveProperty('salto');
    // buraco no cursor (o diário já descartou entradas que esta conexão não recebeu): salto
    passo(); passo();
    d.entradas.splice(0, d.entradas.length - 1);
    sala.transmitir();
    expect(ana.ultima('jogo')!.cena).toMatchObject({ salto: true, eventos: [] });
    sala.transmitir();
    expect(ana.jogos().length).toBe(n + 3);
    // desfazer (os bots aceitam na hora): a época muda e a cena recomeça no fim, sem passado
    const antes = ana.ultima('jogo')!.cena!.epoca;
    const n2 = ana.msgs.length;
    g.tratar(ana, { t: 'desfazer' });
    expect(ana.msgs.slice(n2).find((m) => m.t === 'erro')).toBeUndefined();
    await espera();
    const desfeita = ana.jogos().find((m, i) => i >= n + 3 && m.reinicio === 'desfeita')!;
    expect(desfeita).toBeDefined();
    expect(desfeita.cena!.epoca).not.toBe(antes);
    expect(desfeita.cena!.eventos).toEqual([]);
    expect(sala.game!.g.diario).not.toBeNull();
    // outra conexão no mesmo assento (retomar): começa no fim, sem passado
    const outra = new Falsa();
    g.tratar(outra, { t: 'retomar', codigo: sala.codigo, token: ana.ultima('sala')!.token });
    await espera();
    const primeira = outra.jogos()[0];
    expect(primeira.cena).toMatchObject({ eventos: [] });
    expect(primeira.cena!.de).toBe(primeira.cena!.ate);
    expect(primeira.cena!.ate).toBe(sala.game!.g.diario!.prox - 1);
  }, 120000);
});
