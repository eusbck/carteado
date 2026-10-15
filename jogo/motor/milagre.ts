// Milagre / miracle (CR 702.94): "Você pode revelar esta carta da sua mão ao comprá-la, se for a primeira carta que você
// comprou neste turno. Quando você a revelar assim, você pode conjurá-la pagando [custo] em vez do custo de mana."
//
// Onde o motor faz a parte dele:
//  - actions.ts draw: depois da compra da primeira carta do turno, se ela tem milagre, pergunta se o jogador a revela
//    (revelaMilagre). Revelada, fica com visibleTo 'all' e o gatilho ligado 'mecanica:milagre' (abaixo) fica pendente.
//  - o gatilho resolve conjurando a carta da mão durante a resolução (CR 608.2g), sem olhar o tempo do tipo (ruling).
// O custo de milagre vem da palavra-chave: um texto de custo (Terminus: '{W}') ou { reduz: n }, "o custo de mana dela
// reduzido em {n}" (Aminatou, Veil Piercer), calculado para a porta ou face que vai ser conjurada (ruling da Master of
// Keys sobre Salas).

import { chooseItems, yesNo } from './ask.ts';
import { chars, nameOf, printedChars } from './chars.ts';
import { defineAbility, type AltCastDef, type StaticDef } from './defs.ts';
import { triggered } from './dsl.ts';
import { facesConjuraveis, FACE_AMBAS, rotuloConjurar, temVariasFaces } from './formatos.ts';
import type { G } from './game-context.ts';
import { formatCost, reduceGeneric } from './mana.ts';
import { castSpell } from './stack.ts';
import type { GameObject, ObjId } from './types.ts';

/** parâmetro da palavra-chave milagre concedida com "o custo de mana reduzido em {n}" */
export interface MilagreReduzido { reduz: number }

/** Milagre [custo] (CR 702.94a), em abilities: funciona na mão */
export function miracle(custo: string): StaticDef {
  return {
    kind: 'static', kw: 'miracle', param: custo, zones: ['hand'],
    text: `Milagre ${custo} (você pode conjurar esta carta pelo custo de milagre quando a comprar, se for a primeira carta que você comprou neste turno.)`,
  };
}

/** modificação que concede milagre com custo igual ao custo de mana reduzido em {n} (Aminatou) */
export function milagreReduzido(n: number): { k: 'addKeyword'; kw: string; param: MilagreReduzido } {
  return { k: 'addKeyword', kw: 'miracle', param: { reduz: n } };
}

/** uma forma de conjurar a carta por milagre: a face (undefined = a de sempre), o custo e o rótulo */
export interface OpcaoMilagre { face?: number; custo: string; rotulo: string }

/** os custos de milagre que a carta tem agora, um por habilidade de milagre e, no custo reduzido, por face (CR 709.3) */
export function custosDeMilagre(g: G, id: ObjId): OpcaoMilagre[] {
  const o = g.state.objects[id];
  if (!o) return [];
  const out: OpcaoMilagre[] = [];
  const nome = nameOf(g, id);
  for (const a of chars(g, id).abilities) {
    if (a.kw !== 'miracle') continue;
    if (typeof a.param === 'string') { out.push({ custo: a.param, rotulo: `Conjurar ${nome} por milagre ${a.param}` }); continue; }
    const n = (a.param as MilagreReduzido | undefined)?.reduz;
    if (typeof n !== 'number') continue;
    for (const f of faces(o)) {
      const mc = printedChars(o.def, f ?? 0, o.owner).manaCost;
      // sem custo de mana, não há o que reduzir: o custo é impagável (CR 118.6)
      if (!mc) continue;
      const custo = formatCost(reduceGeneric(mc, n));
      const rotulo = f === undefined ? `Conjurar ${nome}` : rotuloConjurar(o.def, f);
      out.push({ face: f, custo, rotulo: `${rotulo} por milagre ${custo || '{0}'}` });
    }
  }
  // o mesmo custo para a mesma face só aparece uma vez (Aminatou duas vezes no campo)
  return out.filter((x, i) => out.findIndex((y) => y.face === x.face && y.custo === x.custo) === i);
}

/** faces que se podem conjurar da mão; undefined para a carta de uma face só */
function faces(o: GameObject): (number | undefined)[] {
  if (!temVariasFaces(o.def)) return [undefined];
  return facesConjuraveis(o.def, 'hand').filter((f) => f !== FACE_AMBAS);
}

/**
 * O gatilho de milagre (CR 702.94a, 603.11), posto pendente por actions.ts quando a carta é revelada. Na resolução,
 * se a carta continua na mão (ruling 10), o dono pode conjurá-la pelo custo de milagre (rulings 6-7: só agora, e sem
 * olhar o tempo do tipo). Depois ela deixa de estar revelada (CR 702.94b).
 */
export const MIRACLE_TRIGGER = defineAbility('mecanica:milagre', triggered({ kind: 'event', match: () => false }, function* (c) {
  const id = c.source;
  const o = c.g.state.objects[id];
  if (!o || o.zone !== 'hand' || o.owner !== c.you) return;
  const nome = nameOf(c.g, id);
  const opcoes = custosDeMilagre(c.g, id);
  if (opcoes.length && (yield* yesNo(c.g, c.you, `Milagre: conjurar ${nome} por ${opcoes.length === 1 ? opcoes[0].custo || '{0}' : 'um custo de milagre'}? (senão, ela fica na mão)`, 'Sim', 'Não', { about: id }))) {
    let op = opcoes[0];
    if (opcoes.length > 1) {
      const [r] = yield* chooseItems(c.g, c.you, `Milagre: como conjurar ${nome}?`, opcoes.map((x, i) => ({ id: String(i), label: x.rotulo })), 1, 1);
      op = opcoes[Number(r)];
    }
    const alt: AltCastDef = { key: 'miracle', label: `milagre ${op.custo || '{0}'}`, zone: 'hand', mana: op.custo };
    yield* castSpell(c.g, c.you, id, { key: 'miracle', label: alt.label, zone: 'hand', alt, ...(op.face !== undefined ? { face: op.face } : {}), duringResolution: true });
  }
  // CR 702.94b: fica revelada até sair da mão ou até o gatilho resolver
  const x = c.g.state.objects[id];
  if (x?.zone === 'hand') { x.visibleTo = (c.event.visivelAntes as GameObject['visibleTo'] | undefined) ?? null; c.g.bump(); }
}, { text: 'Milagre: você pode conjurar a carta revelada pelo custo de milagre.' }));

/** a mágica foi conjurada pelo custo de milagre? */
export function miraclePaid(c: { method?: string }): boolean {
  return c.method === 'miracle';
}
