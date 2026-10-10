// Arrumação do campo (cliente/src/mesa/arrumacao.ts e geometriaArea.ts, sem DOM): no combate os leques de criaturas
// abrem sem mudar o tamanho das cartas e o combate declarado separa as fichas pelo que cada uma faz; os terrenos
// deitados (peças baixas e largas, os iguais num leque só com os virados embaixo); e a sua área com o campo até a base,
// onde nenhuma carta da arrumação padrão cai embaixo da mão em repouso, das zonas ou do retrato.
import { describe, expect, it } from 'vitest';
import { arrumarCampo, type Arrumacao, type Vao } from '../cliente/src/mesa/arrumacao.ts';
import { medirArea, type LadoAvatar } from '../cliente/src/mesa/geometriaArea.ts';
import { caixaVisual } from '../cliente/src/mesa/posicionar.ts';
import type { ObjId } from '../motor/types.ts';
import type { ObjView } from '../motor/view.ts';

let proximo = 1;
function obj(nome: string, tipos: string[], extra: Partial<ObjView> = {}): ObjView {
  return {
    id: proximo++, def: nome, name: nome, face: 0, owner: 0, controller: 0, tapped: false, faceDown: false, phasedOut: false, token: false,
    counters: {}, damage: 0, attachedTo: null, types: tipos, subtypes: [], supertypes: [], power: tipos.includes('Creature') ? 1 : null,
    toughness: tipos.includes('Creature') ? 1 : null, loyalty: null, manaCost: '', colors: [], keywords: [], abilities: [], commander: false,
    sick: false, prepared: false, classLevel: 0, goaded: false, ...extra,
  };
}

const SEM_ANEXOS = new Map<ObjId, ObjView[]>();
/** quanto de cada carta do leque aparece: a distância até a seguinte (a última aparece inteira) */
function faixas(a: Arrumacao, ids: ObjId[]): number[] {
  const xs = ids.map((id) => a.pos.get(id)!.x).sort((p, q) => p - q);
  return xs.slice(0, -1).map((x, i) => xs[i + 1] - x);
}
const lequeDe = (a: Arrumacao, id: ObjId) => a.leques.find((l) => l.ids.includes(id))?.ids ?? [id];

describe('arrumação no combate', () => {
  // seis fichas iguais, duas criaturas e quatro terrenos (dois iguais)
  const campo = (tapped = false) => {
    const fichas = Array.from({ length: 6 }, () => obj('Goblin', ['Creature'], { token: true, tapped }));
    const criaturas = [obj('Urso', ['Creature']), obj('Elfo', ['Creature'])];
    const terrenos = [obj('Floresta', ['Land']), obj('Floresta', ['Land']), obj('Ilha', ['Land']), obj('Pântano', ['Land'])];
    return { fichas, criaturas, terrenos, objs: [...fichas, ...criaturas, ...terrenos] };
  };

  it('com a decisão aberta o leque abre e cada ficha aparece pelo menos 0,4 da carta; o tamanho não muda', () => {
    for (const [W, H, wBase] of [[1008, 252, 80], [1500, 300, 92], [620, 230, 62], [420, 200, 62]]) {
      for (const tapped of [false, true]) {
        const c = campo(tapped);
        const m = { W, livreW: W, H, wBase, wMin: 28 };
        const fora = arrumarCampo(c.objs, SEM_ANEXOS, {}, {}, m);
        const dentro = arrumarCampo(c.objs, SEM_ANEXOS, {}, {}, m, { largo: true });
        expect(dentro.w).toBe(fora.w);
        expect(lequeDe(dentro, c.fichas[0].id)).toEqual(c.fichas.map((o) => o.id));
        // fora do combate: o leque de sempre (.3 da carta)
        expect(faixas(fora, c.fichas.map((o) => o.id)).every((f) => f === Math.round(fora.w * .3))).toBe(true);
        // no combate, quando cabe: cada uma aparece pelo menos 0,4 da carta, e nada sai do campo pela direita
        const f = faixas(dentro, c.fichas.map((o) => o.id));
        const cabe = f[0] > Math.round(fora.w * .3);
        if (cabe) {
          expect(Math.min(...f)).toBeGreaterThanOrEqual(dentro.w * .4);
          const h = Math.round(dentro.w * 88 / 63);
          // (a virada gira em torno do centro: o canto dela fica (h - w) / 2 à direita do que aparece)
          for (const o of c.objs) expect(dentro.pos.get(o.id)!.x + (o.tapped ? h : dentro.w)).toBeLessThanOrEqual(W + (o.tapped ? (h - dentro.w) / 2 : 0) + 1);
        }
        // os terrenos iguais continuam no passo de sempre
        const flor = c.terrenos.slice(0, 2).map((o) => o.id);
        expect(faixas(dentro, flor)).toEqual([Math.round(dentro.w * .3)]);
      }
    }
    // num campo largo o leque abre de fato
    const c = campo();
    const largo = arrumarCampo(c.objs, SEM_ANEXOS, {}, {}, { W: 1500, livreW: 1500, H: 300, wBase: 92, wMin: 28 }, { largo: true });
    expect(Math.min(...faixas(largo, c.fichas.map((o) => o.id)))).toBeGreaterThanOrEqual(largo.w * .7);
  });

  it('sem espaço, o leque fica como está (e a carta continua do mesmo tamanho)', () => {
    const muitas = Array.from({ length: 24 }, () => obj('Goblin', ['Creature'], { token: true }));
    const outras = Array.from({ length: 10 }, (_, i) => obj(`Criatura ${i}`, ['Creature']));
    const objs = [...muitas, ...outras];
    const m = { W: 420, livreW: 420, H: 150, wBase: 62, wMin: 28 };
    const fora = arrumarCampo(objs, SEM_ANEXOS, {}, {}, m);
    const dentro = arrumarCampo(objs, SEM_ANEXOS, {}, {}, m, { largo: true });
    expect(dentro.w).toBe(fora.w);
    // o leque continua no passo de sempre (no máximo, tudo um pouco para a direita: o respiro da ponta esquerda)
    const ids = muitas.map((o) => o.id);
    expect(faixas(dentro, lequeDe(dentro, ids[0]))).toEqual(faixas(fora, lequeDe(fora, ids[0])));
    const desloc = new Set(objs.map((o) => dentro.pos.get(o.id)!.x - fora.pos.get(o.id)!.x));
    expect(desloc.size === 1 && [0, Math.round(fora.w * .12)].includes([...desloc][0])).toBe(true);
  });

  it('no combate, as linhas de cima começam com um respiro: a marcada da ponta esquerda, inclinada, não sai da área', () => {
    const urso = obj('Urso', ['Creature']), elfo = obj('Elfo', ['Creature']);
    const m = { W: 1008, livreW: 1008, H: 300, wBase: 80, wMin: 28 };
    const dentro = arrumarCampo([urso, elfo], SEM_ANEXOS, {}, {}, m, { largo: true });
    expect(dentro.pos.get(urso.id)!.x).toBe(Math.round(dentro.w * .12));
    expect(arrumarCampo([urso, elfo], SEM_ANEXOS, {}, {}, m).pos.get(urso.id)!.x).toBe(0);
  });

  it('o combate declarado separa as fichas: quem ataca um jogador não fica no leque de quem ataca outro', () => {
    const c = campo(true);
    const m = { W: 1008, livreW: 1008, H: 252, wBase: 80, wMin: 28 };
    const ids = c.fichas.map((o) => o.id);
    expect(lequeDe(arrumarCampo(c.objs, SEM_ANEXOS, {}, {}, m), ids[0])).toEqual(ids);
    // três atacam o jogador 1, duas o jogador 2 e uma fica em casa
    const combate = new Map<ObjId, string>([[ids[0], 'Ap1'], [ids[2], 'Ap1'], [ids[4], 'Ap1'], [ids[1], 'Ap2'], [ids[3], 'Ap2']]);
    const a = arrumarCampo(c.objs, SEM_ANEXOS, {}, {}, m, { combate });
    expect(lequeDe(a, ids[0])).toEqual([ids[0], ids[2], ids[4]]);
    expect(lequeDe(a, ids[1])).toEqual([ids[1], ids[3]]);
    expect(lequeDe(a, ids[5])).toEqual([ids[5]]);
    // e os bloqueadores por atacante bloqueado
    const bloqueio = new Map<ObjId, string>([[ids[0], 'B90'], [ids[1], 'B91'], [ids[2], 'B90']]);
    const b = arrumarCampo(c.objs, SEM_ANEXOS, {}, {}, m, { combate: bloqueio });
    expect(lequeDe(b, ids[0])).toEqual([ids[0], ids[2]]);
    expect(lequeDe(b, ids[3])).toEqual([ids[3], ids[4], ids[5]]);
  });
});

describe('terrenos deitados', () => {
  const m = { W: 1008, livreW: 1008, H: 300, wBase: 80, wMin: 28 };
  const deitados = { deitados: true };

  it('o terreno que não é criatura fica deitado (1,12 × 0,5 da carta), com o que está preso nele; o animado fica de pé', () => {
    const floresta = obj('Floresta', ['Land']);
    const dryad = obj('Dryad Arbor', ['Land', 'Creature']);
    const urso = obj('Urso', ['Creature']);
    const aura = obj('Utopia Sprawl', ['Enchantment'], { attachedTo: floresta.id });
    const anexos = new Map<ObjId, ObjView[]>([[floresta.id, [aura]]]);
    const a = arrumarCampo([floresta, dryad, urso], anexos, {}, {}, m, deitados);
    expect(a.tile).toEqual({ w: Math.round(a.w * 1.12), h: Math.round(a.w * .5) });
    expect([...a.deitadas].sort()).toEqual([floresta.id, aura.id].sort());
    // o preso fica acima do terreno, deslocado por 40% da altura da peça
    expect(a.pos.get(aura.id)!.y).toBe(a.pos.get(floresta.id)!.y - Math.round(a.tile.h * .4));
    expect(a.pos.get(aura.id)!.x).toBe(a.pos.get(floresta.id)!.x);
    // sem a opção, tudo de pé como sempre
    expect(arrumarCampo([floresta, dryad, urso], anexos, {}, {}, m).deitadas.size).toBe(0);
  });

  it('virado não gira: o canto é o da peça (sem o deslocamento da carta de pé virada) e a base da linha não muda', () => {
    const virada = obj('Ilha', ['Land'], { tapped: true });
    const a = arrumarCampo([virada], SEM_ANEXOS, {}, {}, m, deitados);
    const p = a.pos.get(virada.id)!;
    expect(p.x).toBe(0);
    expect(p.y + a.tile.h).toBe(m.H);
    // de pé, a virada ficava (h - w) / 2 para a direita do que aparece
    const dePe = arrumarCampo([virada], SEM_ANEXOS, {}, {}, m);
    expect(dePe.pos.get(virada.id)!.x).toBe(Math.round((Math.round(dePe.w * 88 / 63) - dePe.w) / 2));
  });

  it('terrenos iguais ficam num leque só, virados ou não, com os virados primeiro (embaixo)', () => {
    const fl = [false, true, false, true, true, false, false, false].map((tapped) => obj('Floresta', ['Land'], { tapped }));
    const ilha = obj('Ilha', ['Land']);
    const a = arrumarCampo([...fl, ilha], SEM_ANEXOS, {}, {}, m, deitados);
    const leque = a.leques.find((l) => l.ids.includes(fl[0].id))!;
    expect(leque.deitado).toBe(true);
    expect(leque.ids).toEqual([...fl.filter((o) => o.tapped), ...fl.filter((o) => !o.tapped)].map((o) => o.id));
    // passo do leque de peças: 12% da largura da peça (pelo menos 6 px), e z crescente (os de cima por último)
    expect(faixas(a, leque.ids)).toEqual(leque.ids.slice(1).map(() => Math.max(6, Math.round(a.tile.w * .12))));
    const zs = leque.ids.map((id) => a.pos.get(id)!.z);
    expect(zs).toEqual([...zs].sort((p, q) => p - q));
    // de pé, os virados ficam num leque e os outros noutro
    const dePe = arrumarCampo([...fl, ilha], SEM_ANEXOS, {}, {}, m);
    expect(dePe.leques.filter((l) => l.ids.some((id) => fl.some((o) => o.id === id))).map((l) => l.ids.length).sort()).toEqual([3, 5]);
  });

  it('com 12 terrenos e 8 criaturas, as criaturas ficam pelo menos do tamanho que teriam com os terrenos de pé', () => {
    const nomes = ['Floresta', 'Ilha', 'Pântano'];
    const terrenos = Array.from({ length: 12 }, (_, i) => obj(i % 4 === 3 ? `Terreno ${i}` : nomes[i % 4], ['Land'], { tapped: i % 3 === 0 }));
    const criaturas = Array.from({ length: 8 }, (_, i) => obj(`Criatura ${i}`, ['Creature']));
    for (const [W, H] of [[672, 407], [1312, 578], [992, 473]]) {
      const mm = { W, livreW: W, H, wBase: 92, wMin: 40 };
      const dePe = arrumarCampo([...criaturas, ...terrenos], SEM_ANEXOS, {}, {}, mm);
      const deitada = arrumarCampo([...criaturas, ...terrenos], SEM_ANEXOS, {}, {}, mm, deitados);
      expect(deitada.w).toBeGreaterThanOrEqual(dePe.w);
    }
  });
});

describe('sua área com o campo até a base', () => {
  /** a sua área nas telas de 1280, 1600 e 1920 (4 jogadores e um contra um), com a barra lateral aberta (248 px) */
  const areas = [[1280, 800], [1600, 900], [1920, 1080]].flatMap(([vw, vh]) => [
    { nome: `${vw}x${vh} 4p`, w: vw - 248, h: Math.round(vh * .59), duelo: false },
    { nome: `${vw}x${vh} 1v1`, w: vw - 248, h: Math.round(vh * .54), duelo: true },
  ]);
  const caixa = (a: Arrumacao, o: ObjView) => {
    const p = a.pos.get(o.id)!;
    if (a.deitadas.has(o.id)) return { x0: p.x, y0: p.y, x1: p.x + a.tile.w, y1: p.y + a.tile.h };
    return caixaVisual({ x: p.x, y: p.y, w: a.w, h: Math.round(a.w * 88 / 63), virada: o.tapped });
  };
  const toca = (c: { x0: number; y0: number; x1: number; y1: number }, v: Vao) => c.x0 < v.x1 && c.x1 > v.x0 && c.y0 < v.y1 && c.y1 > v.y0;
  // um campo de meio de partida: criaturas, um leque de fichas, artefatos e terrenos (iguais e diferentes, alguns virados)
  const campo = () => {
    const nomes = ['Floresta', 'Ilha', 'Templo', 'Torre', 'Floresta', 'Ilha'];
    const criaturas = Array.from({ length: 7 }, (_, i) => obj(`Criatura ${i}`, ['Creature'], { tapped: i === 2 }));
    const fichas = Array.from({ length: 4 }, () => obj('Soldado', ['Creature'], { token: true }));
    const outros = [obj('Sol Ring', ['Artifact']), obj('Arcane Signet', ['Artifact'])];
    const terrenos = Array.from({ length: 11 }, (_, i) => obj(nomes[i % 6], ['Land'], { tapped: i % 4 === 1 }));
    return [...criaturas, ...fichas, ...outros, ...terrenos];
  };

  it('nenhuma carta da arrumação padrão cai embaixo da mão em repouso, das zonas ou do retrato (0, 7 e 10 cartas na mão)', () => {
    const objs = campo();
    for (const ar of areas) {
      for (const nMao of [0, 7, 10]) {
        for (const lado of ['canto', 'esquerda'] as LadoAvatar[]) {
          for (const deitados of [true, false]) {
            const md = medirArea({ w: ar.w, h: ar.h, eu: true, compacta: false, duelo: ar.duelo, lado, nMao, reservaDireita: 336 });
            const a = arrumarCampo(objs, SEM_ANEXOS, {}, {}, { W: md.campoW, livreW: md.livreW, H: md.campoH, wBase: md.wBase, wMin: md.wMin, vaos: md.vaos }, { deitados });
            const ruins = objs.filter((o) => md.vaos.some((v) => toca(caixa(a, o), v)));
            const quando = `${ar.nome}, ${nMao} na mão, retrato ${lado}, ${deitados ? 'deitados' : 'de pé'}`;
            expect(ruins.map((o) => o.name), quando).toEqual([]);
            // e tudo dentro do campo, na altura
            expect(objs.every((o) => caixa(a, o).y1 <= md.campoH + .5 && caixa(a, o).y0 >= -.5), quando).toBe(true);
          }
        }
      }
    }
  });

  it('a faixa da mão é a de sete cartas: comprar até a sétima não muda os retângulos (os terrenos não mudam de lugar)', () => {
    const base = { w: 1424, h: 637, eu: true, compacta: false, duelo: false, reservaDireita: 336 };
    const sete = medirArea({ ...base, nMao: 7 }).vaos;
    for (const n of [0, 1, 3, 6]) expect(medirArea({ ...base, nMao: n }).vaos).toEqual(sete);
    const doze = medirArea({ ...base, nMao: 12 }).vaos;
    expect(doze[0].x1 - doze[0].x0).toBeGreaterThanOrEqual(sete[0].x1 - sete[0].x0);
    // o campo vai até 6 px da base; o do oponente termina acima das zonas
    expect(medirArea({ ...base, nMao: 7 }).campoH).toBe(637 - 58 - 6);
    const op = medirArea({ ...base, eu: false, compacta: true });
    expect(op.campoH).toBe(637 - 44 - op.zonasH);
  });
});
