// Fase 9, itens 1.3 e 2.4: arrumar o próprio campo arrastando (contas do cliente, sem DOM) e a
// mensagem de posição em grupo no servidor.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import { arrumarCampo } from '../cliente/src/mesa/arrumacao.ts';
import { caixaVisual, limitarDeslocamento, limites, proporcional, retangulo, semConfirmadas, tocaRetangulo, type Caixa } from '../cliente/src/mesa/posicionar.ts';
import { registry } from '../motor/defs.ts';
import type { DeckList } from '../motor/state.ts';
import type { ObjId } from '../motor/types.ts';
import type { ObjView } from '../motor/view.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgCliente, MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

const W = 1008, H = 252;

describe('posicionar: contas do arraste', () => {
  it('a carta virada aparece girada em torno do centro', () => {
    expect(caixaVisual({ x: 100, y: 50, w: 70, h: 98 })).toEqual({ x0: 100, y0: 50, x1: 170, y1: 148 });
    // de pé 70×98; virada fica 98×70 com o mesmo centro (135, 99)
    expect(caixaVisual({ x: 100, y: 50, w: 70, h: 98, virada: true })).toEqual({ x0: 86, y0: 64, x1: 184, y1: 134 });
  });

  it('o grupo anda exatamente o que o ponteiro andou (o ponto pego fica sob o ponteiro)', () => {
    const grupo: Caixa[] = [{ x: 100, y: 40, w: 70, h: 98 }, { x: 300, y: 120, w: 70, h: 98, virada: true }];
    expect(limitarDeslocamento(grupo, 37.5, -12.25, W, H)).toEqual({ dx: 37.5, dy: -12.25 });
    // na volta para o lugar de origem, nada sobra
    expect(limitarDeslocamento(grupo, 0, 0, W, H)).toEqual({ dx: 0, dy: 0 });
  });

  it('na borda do campo o grupo para inteiro, mantendo a distância entre as cartas', () => {
    const grupo: Caixa[] = [{ x: 100, y: 40, w: 70, h: 98 }, { x: 300, y: 120, w: 70, h: 98 }];
    // para a direita: a de x=300 encosta em W - 70
    expect(limitarDeslocamento(grupo, 5000, 0, W, H).dx).toBe(W - 70 - 300);
    // para cima: a de y=40 encosta no topo
    expect(limitarDeslocamento(grupo, 0, -500, W, H).dy).toBe(-40);
    // para baixo: a de y=120 encosta embaixo
    expect(limitarDeslocamento(grupo, 0, 500, W, H).dy).toBe(H - 98 - 120);
  });

  it('a carta virada encosta pela caixa que aparece, dentro do intervalo que o servidor aceita', () => {
    const c: Caixa = { x: 200, y: 100, w: 70, h: 98, virada: true };
    const l = limites(c, W, H);
    // pela esquerda, a caixa virada (14 px mais larga de cada lado) encosta em 0
    expect(l.xMin).toBe(14);
    // por cima, a caixa virada começa 14 px abaixo do canto: o canto pode subir até -14 (-0,055 de 252 passa do servidor)
    expect(l.yMin).toBeCloseTo(-0.05 * H);
    expect(l.yMax).toBe(H - 70 - 14);
    const d = limitarDeslocamento([c], -1000, -1000, W, H);
    const [qx, qy] = proporcional(c.x + d.dx, c.y + d.dy, W, H);
    expect(qx).toBeGreaterThanOrEqual(-0.05);
    expect(qy).toBeGreaterThanOrEqual(-0.05);
  });

  it('uma carta que já estava fora do campo (outra tela) pode ficar, mas não vai mais para fora', () => {
    const fora: Caixa = { x: W - 20, y: 10, w: 70, h: 98 };
    const dentro: Caixa = { x: 100, y: 10, w: 70, h: 98 };
    expect(limitarDeslocamento([fora, dentro], 30, 0, W, H).dx).toBe(0);
    expect(limitarDeslocamento([fora, dentro], -30, 0, W, H).dx).toBe(-30);
  });

  it('a posição proporcional volta ao mesmo lugar (erro de no máximo 0,00005 do campo: 0,08 px em 1648 px)', () => {
    for (const [w, h] of [[1008, 252], [1648, 371], [3000, 900]]) {
      for (const x of [0, 13.37, 259.963, w * .7123]) {
        const [qx, qy] = proporcional(x, x / 4, w, h);
        expect(Math.abs(qx * w - x)).toBeLessThanOrEqual(w * 5e-5 + 1e-9);
        expect(Math.abs(qy * h - x / 4)).toBeLessThanOrEqual(h * 5e-5 + 1e-9);
      }
    }
  });

  it('retângulo de seleção: qualquer direção, cortado pelo campo; pega as cartas que ele toca', () => {
    expect(retangulo(300, 200, 100, -50, W, H)).toEqual({ x0: 100, y0: 0, x1: 300, y1: 200 });
    expect(retangulo(-20, 10, 2000, 400, W, H)).toEqual({ x0: 0, y0: 10, x1: W, y1: H });
    const r = retangulo(150, 50, 260, 120, W, H);
    expect(tocaRetangulo({ x: 100, y: 40, w: 70, h: 98 }, r)).toBe(true); // encosta pela borda direita da carta
    expect(tocaRetangulo({ x: 0, y: 40, w: 70, h: 98 }, r)).toBe(false);
    // de pé ela não chegaria (x de 270 a 340), virada a caixa começa em 256
    expect(tocaRetangulo({ x: 270, y: 40, w: 70, h: 98 }, r)).toBe(false);
    expect(tocaRetangulo({ x: 270, y: 40, w: 70, h: 98, virada: true }, r)).toBe(true);
  });

  it('a posição local só sai quando o servidor confirma o mesmo lugar', () => {
    const locais: Record<string, [number, number]> = { 1: [0.25, 0.5], 2: [0.1, 0.1], 3: [0.9, 0.9] };
    const valem = (id: string) => id !== '3';
    // vista que chegou antes da confirmação (sem a carta 1, e a 2 no lugar antigo): fica tudo, menos a que saiu do campo
    expect(semConfirmadas(locais, { 2: [0.6, 0.6] }, valem)).toEqual({ 1: [0.25, 0.5], 2: [0.1, 0.1] });
    // confirmação da 1
    expect(semConfirmadas({ 1: [0.25, 0.5], 2: [0.1, 0.1] }, { 1: [0.25, 0.5], 2: [0.6, 0.6] }, valem)).toEqual({ 2: [0.1, 0.1] });
    // sem mudança devolve o mesmo objeto (a mesa não redesenha à toa)
    const so: Record<string, [number, number]> = { 2: [0.1, 0.1] };
    expect(semConfirmadas(so, {}, valem)).toBe(so);
  });
});

let proximo = 1;
function obj(nome: string, tipos: string[], extra: Partial<ObjView> = {}): ObjView {
  return {
    id: proximo++, def: nome, name: nome, face: 0, owner: 0, controller: 0, tapped: false, faceDown: false, phasedOut: false, token: false,
    counters: {}, damage: 0, attachedTo: null, types: tipos, subtypes: [], supertypes: [], power: tipos.includes('Creature') ? 2 : null,
    toughness: tipos.includes('Creature') ? 2 : null, loyalty: null, manaCost: '', colors: [], keywords: [], abilities: [], commander: false,
    sick: false, prepared: false, classLevel: 0, goaded: false, ...extra,
  };
}

describe('arrumação do campo com cartas postas num lugar', () => {
  const medidas = { W: W - 336, livreW: W, H, wBase: 80, wMin: 40 };
  const campo = () => {
    const criaturas = ['Urso', 'Elfo', 'Lobo', 'Gato'].map((n) => obj(n, ['Creature']));
    const terrenos = [obj('Floresta', ['Land']), obj('Floresta', ['Land']), obj('Ilha', ['Land'], { tapped: true }), obj('Pântano', ['Land'])];
    const aura = obj('Aura', ['Enchantment'], { attachedTo: criaturas[1].id });
    return { objs: [...criaturas, ...terrenos], criaturas, terrenos, aura, anexos: new Map<ObjId, ObjView[]>([[criaturas[1].id, [aura]]]) };
  };

  it('pôr cartas num lugar não muda o lugar nem o tamanho das outras', () => {
    const c = campo();
    const antes = arrumarCampo(c.objs, c.anexos, {}, {}, medidas);
    // move uma criatura do meio da fila e a Ilha virada
    const postas: Record<string, [number, number]> = { [c.criaturas[0].id]: [0.8, 0.1], [c.terrenos[2].id]: [0.6, 0.5] };
    const depois = arrumarCampo(c.objs, c.anexos, postas, {}, medidas);
    expect(depois.w).toBe(antes.w);
    for (const o of [...c.objs, c.aura]) {
      if (postas[o.id]) continue;
      expect(depois.pos.get(o.id)).toEqual(antes.pos.get(o.id));
    }
    // a posta fica no canto pedido, proporcional ao campo inteiro (não à parte da arrumação)
    expect(depois.pos.get(c.criaturas[0].id)).toMatchObject({ x: 0.8 * W, y: 0.1 * H });
    expect(depois.pos.get(c.terrenos[2].id)).toMatchObject({ x: 0.6 * W, y: 0.5 * H });
  });

  it('o anexo segue a carta posta do mesmo jeito que na arrumação, virada ou não', () => {
    for (const virada of [false, true]) {
      const c = campo();
      c.criaturas[1].tapped = virada;
      const antes = arrumarCampo(c.objs, c.anexos, {}, {}, medidas);
      const h = antes.pos.get(c.criaturas[1].id)!, a = antes.pos.get(c.aura.id)!;
      const postas: Record<string, [number, number]> = { [c.criaturas[1].id]: [0.5, 0.6] };
      const depois = arrumarCampo(c.objs, c.anexos, postas, {}, medidas);
      const h2 = depois.pos.get(c.criaturas[1].id)!, a2 = depois.pos.get(c.aura.id)!;
      // a aura fica na mesma posição em relação à carta (até o arredondamento da arrumação)
      expect(Math.abs((a2.x - h2.x) - (a.x - h.x))).toBeLessThanOrEqual(0.5);
      expect(Math.abs((a2.y - h2.y) - (a.y - h.y))).toBeLessThanOrEqual(0.5);
      expect(a2.z).toBeLessThan(h2.z);
    }
  });

  it('o leque não conta a carta posta noutro lugar, e a última solta fica por cima', () => {
    const c = campo();
    const [f1, f2] = c.terrenos;
    expect(arrumarCampo(c.objs, c.anexos, {}, {}, medidas).leques.find((l) => l.ids.includes(f1.id))?.ids).toEqual([f1.id, f2.id]);
    const postas: Record<string, [number, number]> = { [c.criaturas[0].id]: [0.1, 0.1], [c.criaturas[2].id]: [0.15, 0.1] };
    const z = (ordem: Record<string, number>) => { const a = arrumarCampo(c.objs, c.anexos, postas, ordem, medidas); return a.pos.get(c.criaturas[0].id)!.z - a.pos.get(c.criaturas[2].id)!.z; };
    expect(z({})).toBeLessThan(0);
    expect(z({ [c.criaturas[2].id]: 1, [c.criaturas[0].id]: 2 })).toBeGreaterThan(0);
  });
});

// ------------------------------------------------------------------ servidor: posição em grupo

const DECKS = decksJson as DeckList[];
class Falsa implements Conexao {
  sala: Conexao['sala'] = null;
  assento: number | null = null;
  msgs: MsgServidor[] = [];
  enviar(m: MsgServidor) { this.msgs.push(m); }
  ultima<T extends MsgServidor['t']>(t: T): Extract<MsgServidor, { t: T }> | undefined {
    return [...this.msgs].reverse().find((m) => m.t === t) as Extract<MsgServidor, { t: T }> | undefined;
  }
}
const espera = () => new Promise((r) => setTimeout(r, 0));

async function ateAPrioridade(g: Gerente, ana: Falsa) {
  for (let i = 0; i < 120; i++) {
    await espera();
    const d = ana.ultima('jogo')?.vista.decision;
    if (d?.kind === 'priority' && d.actions.some((a) => a.kind === 'manual')) return d;
    if (!d) continue;
    const resp: MsgCliente = d.kind === 'mulligan' ? { t: 'responder', decisao: d.id, resposta: { kind: 'mulligan', keep: true } }
      : d.kind === 'priority' ? { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: 'pass' } }
      : d.kind === 'select' ? { t: 'responder', decisao: d.id, resposta: { kind: 'select', ids: d.items.filter((x) => !x.disabled).slice(0, d.min).map((x) => x.id) } }
      : d.kind === 'payment' ? { t: 'responder', decisao: d.id, resposta: { kind: 'payment', auto: true } }
      : d.kind === 'attackers' ? { t: 'responder', decisao: d.id, resposta: { kind: 'attackers', attacks: [] } }
      : d.kind === 'blockers' ? { t: 'responder', decisao: d.id, resposta: { kind: 'blockers', blocks: [] } }
      : d.kind === 'number' ? { t: 'responder', decisao: d.id, resposta: { kind: 'number', value: d.min } }
      : { t: 'conceder' };
    g.tratar(ana, resp);
  }
  throw new Error('a prioridade não chegou');
}

describe('servidor: posição de várias permanentes numa mensagem', () => {
  it('grava o grupo inteiro (4 casas) numa vista só; se uma não vale, não grava nenhuma', async () => {
    const g = new Gerente(new Banco(':memory:'), DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '1v1' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    g.tratar(ana, { t: 'deck', deck: DECKS[0].id });
    g.tratar(ana, { t: 'bot', assento: 1, deck: DECKS[1].id });
    g.tratar(ana, { t: 'iniciar' });
    const d = await ateAPrioridade(g, ana);
    const ficha = [...registry.tokens.keys()][0];
    g.tratar(ana, { t: 'responder', decisao: d.id, resposta: { kind: 'priority', action: 'manual', manual: { k: 'ficha', def: ficha, n: 3, player: 0 } } });
    await espera();
    const sala = g.salas.get(codigo)!;
    const st = sala.game!.state;
    const minhas = st.zones.battlefield.filter((id) => st.objects[id].controller === 0);
    expect(minhas.length).toBeGreaterThanOrEqual(3);
    const [a, b, c] = minhas;

    const vistas = () => ana.msgs.filter((m) => m.t === 'jogo').length;
    const n0 = vistas();
    g.tratar(ana, { t: 'posicao', lista: [{ obj: a, x: 0.123456, y: 0.5 }, { obj: b, x: 0.2, y: -0.04 }, { obj: c, x: 1.04, y: 0.98765 }] });
    const pos = ana.ultima('jogo')!.posicoes;
    expect(pos[String(a)]).toEqual([0.1235, 0.5]);
    expect(pos[String(b)]).toEqual([0.2, -0.04]);
    expect(pos[String(c)]).toEqual([1.04, 0.9877]);
    // uma vista para o grupo, não uma por carta
    expect(vistas() - n0).toBe(1);

    // uma de fora do intervalo ou de outro jogador: nada muda
    const doBot = st.zones.battlefield.find((id) => st.objects[id].controller === 1);
    const casos: [MsgCliente, RegExp][] = [
      [{ t: 'posicao', lista: [{ obj: a, x: 0.5, y: 0.5 }, { obj: b, x: 1.2, y: 0.5 }] }, /inválida/],
      ...(doBot !== undefined ? [[{ t: 'posicao', lista: [{ obj: a, x: 0.5, y: 0.5 }, { obj: doBot, x: 0.5, y: 0.5 }] }, /suas permanentes/] as [MsgCliente, RegExp]] : []),
      [{ t: 'posicao', lista: [] }, /inválida/],
      [{ t: 'posicao', lista: [null as unknown as { obj: number; x: number; y: number }] }, /inválida/],
    ];
    for (const [m, erro] of casos) {
      const n = ana.msgs.length;
      g.tratar(ana, m);
      expect(ana.ultima('erro')?.msg).toMatch(erro);
      expect(ana.msgs.slice(n).some((x) => x.t === 'jogo')).toBe(false);
    }
    expect(sala.d.partida!.posicoes![String(a)]).toEqual([0.1235, 0.5]);

    // uma carta do grupo que já saiu do campo (sacrificada no meio do caminho): ela fica de fora, as outras andam
    const errosAntes = ana.msgs.filter((m) => m.t === 'erro').length;
    g.tratar(ana, { t: 'posicao', lista: [{ obj: a, x: 0.6, y: 0.5 }, { obj: 99999, x: 0.5, y: 0.5 }] });
    expect(ana.msgs.filter((m) => m.t === 'erro').length).toBe(errosAntes);
    expect(ana.ultima('jogo')!.posicoes[String(a)]).toEqual([0.6, 0.5]);
    expect(ana.ultima('jogo')!.posicoes['99999']).toBeUndefined();

    // a de uma carta só continua valendo, também com 4 casas
    g.tratar(ana, { t: 'posicao', obj: a, x: 0.33333, y: 0.25 });
    expect(ana.ultima('jogo')!.posicoes[String(a)]).toEqual([0.3333, 0.25]);
  }, 60000);
});
