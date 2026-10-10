// Arrumação do campo no combate (cliente/src/mesa/arrumacao.ts, sem DOM): com a decisão de combate aberta os leques
// de criaturas abrem sem mudar o tamanho das cartas, e o combate declarado separa as fichas pelo que cada uma faz.
import { describe, expect, it } from 'vitest';
import { arrumarCampo, type Arrumacao } from '../cliente/src/mesa/arrumacao.ts';
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
    expect([...dentro.pos]).toEqual([...fora.pos]);
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
