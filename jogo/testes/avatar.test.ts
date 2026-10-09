// Avatares dos jogadores na mesa: o catálogo dos nove retratos (imagens com transparência, um por comandante dos
// decks da mesa), a escolha do retrato no servidor (só os do catálogo; todos recebem; volta ao automático com null)
// e a arrumação padrão do campo deixando livre o espaço do medalhão (em cima no oponente, embaixo na sua área).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import decksJson from './decks-teste.json' with { type: 'json' };
import decksMesa from '../gerado/decks.json' with { type: 'json' };
import { arrumarCampo } from '../cliente/src/mesa/arrumacao.ts';
import type { DeckList } from '../motor/state.ts';
import type { ObjId } from '../motor/types.ts';
import type { ObjView } from '../motor/view.ts';
import { AVATARES, avatarDoComandante, avatarValido } from '../servidor/avatares.ts';
import { Banco } from '../servidor/banco.ts';
import type { MsgServidor } from '../servidor/protocolo.ts';
import { Gerente, SEM_ATRASO, type Conexao } from '../servidor/salas.ts';

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

describe('avatares: catálogo', () => {
  it('nove retratos com ids únicos, e cada comandante dos decks da mesa tem o seu', () => {
    expect(AVATARES).toHaveLength(9);
    expect(new Set(AVATARES.map((a) => a.id)).size).toBe(9);
    for (const d of decksMesa as { comandante: string }[]) expect(avatarDoComandante(d.comandante), d.comandante).not.toBeNull();
    expect(avatarDoComandante('Comandante que não tem retrato')).toBeNull();
    expect(avatarDoComandante(null)).toBeNull();
    expect(avatarValido('jace')).toBe(true);
    expect(avatarValido('../jace')).toBe(false);
    expect(avatarValido(3)).toBe(false);
  });

  it('cada retrato existe no cliente, é quadrado e tem transparência de verdade', async () => {
    for (const a of AVATARES) {
      const arquivo = join(import.meta.dirname, '..', 'cliente', 'src', 'imagens', 'avatares', `${a.id}.webp`);
      expect(existsSync(arquivo), a.id).toBe(true);
      const m = await sharp(arquivo).metadata();
      expect(m.width, a.id).toBe(m.height);
      expect(m.hasAlpha, a.id).toBe(true);
      expect((await sharp(arquivo).stats()).isOpaque, a.id).toBe(false);
    }
  });
});

describe('avatares: escolha no servidor', () => {
  function sala(banco = new Banco(':memory:')) {
    const g = new Gerente(banco, DECKS, SEM_ATRASO);
    const ana = new Falsa();
    g.tratar(ana, { t: 'criar', nome: 'Ana', senhaSala: 'segredo', modo: '4p' });
    const codigo = ana.ultima('sala')!.sala.codigo;
    const bruno = new Falsa();
    g.tratar(bruno, { t: 'entrar', codigo, senhaSala: 'segredo', nome: 'Bruno' });
    g.tratar(ana, { t: 'bot', assento: 2, deck: DECKS[2].id });
    return { g, banco, ana, bruno, codigo };
  }

  it('começa sem retrato; a escolha vale para todos; null volta ao automático', async () => {
    const { g, ana, bruno } = sala();
    await espera();
    expect(ana.ultima('sala')!.sala.assentos.map((a) => a.avatar ?? null)).toEqual([null, null, null, null]);
    g.tratar(ana, { t: 'avatar', avatar: 'jace' });
    await espera();
    expect(bruno.ultima('sala')!.sala.assentos[0].avatar).toBe('jace');
    g.tratar(ana, { t: 'avatar', avatar: null });
    await espera();
    expect(bruno.ultima('sala')!.sala.assentos[0].avatar).toBeNull();
  });

  it('retrato fora do catálogo é recusado e nada muda', async () => {
    const { g, ana } = sala();
    g.tratar(ana, { t: 'avatar', avatar: 'gisa' });
    for (const ruim of ['dragao', '', '../gisa', 7 as unknown as string]) g.tratar(ana, { t: 'avatar', avatar: ruim });
    await espera();
    expect(ana.msgs.filter((m) => m.t === 'erro').map((m) => (m as { msg: string }).msg)).toEqual(Array(4).fill('Retrato desconhecido'));
    expect(ana.ultima('sala')!.sala.assentos[0].avatar).toBe('gisa');
  });

  it('o retrato fica salvo com a sala e volta depois de reiniciar o servidor', async () => {
    const { g, banco, bruno, codigo } = sala();
    g.tratar(bruno, { t: 'avatar', avatar: 'rootha' });
    await espera();
    const token = bruno.ultima('sala')!.token;
    const g2 = new Gerente(banco, DECKS, SEM_ATRASO);
    g2.restaurar();
    const volta = new Falsa();
    g2.tratar(volta, { t: 'retomar', codigo, token });
    expect(volta.ultima('sala')!.sala.assentos[1].avatar).toBe('rootha');
  });
});

describe('avatares: a arrumação deixa livre o espaço do medalhão', () => {
  let proximo = 1;
  const obj = (nome: string, tipos: string[]): ObjView => ({
    id: proximo++, def: nome, name: nome, face: 0, owner: 0, controller: 0, tapped: false, faceDown: false, phasedOut: false, token: false,
    counters: {}, damage: 0, attachedTo: null, types: tipos, subtypes: [], supertypes: [], power: tipos.includes('Creature') ? 2 : null,
    toughness: tipos.includes('Creature') ? 2 : null, loyalty: null, manaCost: '', colors: [], keywords: [], abilities: [], commander: false,
    sick: false, prepared: false, classLevel: 0, goaded: false,
  } as ObjView);
  const W = 1200, H = 360;
  const medidas = { W, livreW: W, H, wBase: 80, wMin: 40 };
  // seis criaturas diferentes e seis terrenos diferentes: uma linha de cada que passa do meio do campo
  const criaturas = Array.from({ length: 9 }, (_, i) => obj(`Criatura ${i}`, ['Creature']));
  const terrenos = Array.from({ length: 9 }, (_, i) => obj(`Terreno ${i}`, ['Land']));
  const objs = [...criaturas, ...terrenos];
  const anexos = new Map<ObjId, ObjView[]>();
  const caixas = (a: ReturnType<typeof arrumarCampo>, lista: ObjView[]) => lista.map((o) => { const p = a.pos.get(o.id)!; return { x0: p.x, x1: p.x + a.w, y0: p.y, y1: p.y + Math.round(a.w * 88 / 63) }; });
  const vao = { x0: 520, x1: 680 };

  it('sem vão, as linhas passam pelo meio do campo (o caso que o vão evita)', () => {
    const a = arrumarCampo(objs, anexos, {}, {}, medidas);
    expect(caixas(a, criaturas).some((c) => c.x1 > vao.x0 && c.x0 < vao.x1)).toBe(true);
    expect(caixas(a, terrenos).some((c) => c.x1 > vao.x0 && c.x0 < vao.x1)).toBe(true);
  });

  it('oponente: as criaturas da linha de cima pulam o vão do medalhão em cima', () => {
    const a = arrumarCampo(objs, anexos, {}, {}, { ...medidas, vao: { ...vao, topo: 120 } });
    const emCima = caixas(a, criaturas).filter((c) => c.y0 < 120);
    expect(emCima.length).toBeGreaterThan(0);
    expect(emCima.every((c) => c.x1 <= vao.x0 || c.x0 >= vao.x1)).toBe(true);
    // os terrenos de baixo continuam passando pelo meio (o vão é só em cima)
    expect(caixas(a, terrenos).some((c) => c.x1 > vao.x0 && c.x0 < vao.x1)).toBe(true);
  });

  it('sua área: os terrenos da linha de baixo pulam o vão do medalhão embaixo', () => {
    const a = arrumarCampo(objs, anexos, {}, {}, { ...medidas, vao: { ...vao, baixo: 140 } });
    const embaixo = caixas(a, terrenos).filter((c) => c.y1 > H - 140);
    expect(embaixo.length).toBeGreaterThan(0);
    expect(embaixo.every((c) => c.x1 <= vao.x0 || c.x0 >= vao.x1)).toBe(true);
  });

  it('campo estreito demais para pular o vão: a arrumação termina e põe todas as cartas', () => {
    const estreito = { W: 200, livreW: 200, H: 200, wBase: 80, wMin: 40, vao: { x0: 40, x1: 160, topo: 200, baixo: 200 } };
    const a = arrumarCampo(objs, anexos, {}, {}, estreito);
    expect(objs.every((o) => a.pos.has(o.id))).toBe(true);
  });
});
