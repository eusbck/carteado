// F3 (estudo do Arena, registro R1): linhas do registro com estrutura. Cada linha guarda o tipo (`kind`), quem fez
// (`actor`), as cartas e jogadores citados (`refs`) e o texto em pedaços (`parts`, literais e {ref: n}). O `text`
// continua igual ao de antes (a busca, o desfazer, os bots e os testes leem o texto).
//
// Uso, com template marcado:
//   reg(g, 'conjura', { rule: '601.2' })`${jog(p)} conjura ${obj(id)}.`
//   reg(g, 'revela', { rule: '701.20' })`${jog(p)} revela ${objs(ids)}.`   (lista separada por ", ")
// Valores que não são ref (string, número) entram como texto literal. Para pedaços que se repetem (os bloqueios, os
// alvos), `trecho` monta um pedaço com o mesmo template e `lista` junta vários com um separador:
//   reg(g, 'bloqueio')`Bloqueios: ${lista(pares.map(([b, a]) => trecho`${obj(b)} bloqueia ${obj(a)}`), '; ')}.`

import { nameOf } from './chars.ts';
import type { G } from './game-context.ts';
import type { LogEntry, LogKind, LogPapel, LogPart, LogRef, ObjId, PlayerId, TargetRef } from './types.ts';
import { quemVe } from './visibilidade.ts';

interface RefJogador { readonly __reg: 'jogador'; id: PlayerId; papel?: LogPapel }
interface RefObj { readonly __reg: 'obj'; id: ObjId; papel?: LogPapel; nome?: string }
/** uma sequência de valores, com `sep` entre eles (`vazio` quando não há nenhum) */
interface RefSeq { readonly __reg: 'seq'; vals: ValorReg[]; sep: string; vazio: string }
export type ValorReg = RefJogador | RefObj | RefSeq | string | number;

/** um jogador citado (o nome sai de `players[id].name`) */
export const jog = (id: PlayerId, papel?: LogPapel): RefJogador => ({ __reg: 'jogador', id, papel });
/** uma carta citada (o nome sai de `nameOf`, como nos textos de antes; `nome` troca o texto mostrado) */
export const obj = (id: ObjId, papel?: LogPapel, nome?: string): RefObj => ({ __reg: 'obj', id, papel, nome });
/** vários valores (refs, trechos ou literais), separados por `sep` (", " por padrão); `vazio` quando a lista é vazia */
export const lista = (vals: ValorReg[], sep = ', ', vazio = ''): RefSeq => ({ __reg: 'seq', vals, sep, vazio });
/** várias cartas, separadas por `sep` (", " por padrão); `vazio` é o texto quando a lista é vazia */
export const objs = (ids: ObjId[], papel?: LogPapel, sep = ', ', vazio = ''): RefSeq => lista(ids.map((id) => obj(id, papel)), sep, vazio);
/** vários jogadores, separados por `sep` (", " por padrão) */
export const jogs = (ids: PlayerId[], papel?: LogPapel, sep = ', '): RefSeq => lista(ids.map((id) => jog(id, papel)), sep);
/** um pedaço de linha montado com o mesmo template de `reg` (para usar dentro de `lista` ou como valor) */
export function trecho(strings: TemplateStringsArray, ...vals: ValorReg[]): RefSeq {
  const out: ValorReg[] = [];
  strings.forEach((s, i) => { if (s) out.push(s); if (i < vals.length) out.push(vals[i]); });
  return lista(out, '');
}
/** um alvo (jogador ou objeto) citado; o texto é o mesmo de `targetLabel` */
export const alvo = (t: TargetRef, papel: LogPapel = 'alvo'): ValorReg => (t.kind === 'player' ? jog(t.id, papel) : obj(t.id, papel));

type Opcoes = Partial<Pick<LogEntry, 'rule' | 'visibleTo' | 'hiddenText' | 'actor'>>;

/** o texto, as refs e os pedaços de uma sequência de valores (o miolo de `reg`; o redator também usa) */
export function montar(g: G, vals: ValorReg[]): { text: string; refs: LogRef[]; parts: LogPart[] } {
  const refs: LogRef[] = [];
  const parts: LogPart[] = [];
  let text = '';
  const lit = (s: string) => {
    if (!s) return;
    text += s;
    const ult = parts[parts.length - 1];
    if (typeof ult === 'string') parts[parts.length - 1] = ult + s; else parts.push(s);
  };
  const valor = (v: ValorReg): void => {
    if (typeof v === 'string' || typeof v === 'number') { lit(String(v)); return; }
    if (v.__reg === 'jogador') {
      refs.push({ k: 'jogador', id: v.id, ...(v.papel ? { papel: v.papel } : {}) });
      parts.push({ ref: refs.length - 1 });
      text += g.state.players[v.id]?.name ?? '?';
    } else if (v.__reg === 'obj') {
      const o = g.state.objects[v.id] ?? g.state.lki[v.id]?.obj;
      const n = v.nome ?? nameOf(g, v.id);
      // Onda B: quem controlava a carta citada como alvo ou vítima (o "afetou você" do registro); público
      const ctl = v.papel === 'alvo' || v.papel === 'vitima' ? (g.state.lki[v.id]?.chars.controller ?? o?.controller) : undefined;
      refs.push({ k: 'obj', id: v.id, card: o?.card ?? null, name: n, ...(v.papel ? { papel: v.papel } : {}), vis: o ? quemVe(g, o) : null, ...(ctl !== undefined ? { ctl } : {}) });
      parts.push({ ref: refs.length - 1 });
      text += n;
    } else {
      if (!v.vals.length) lit(v.vazio);
      v.vals.forEach((x, k) => { if (k) lit(v.sep); valor(x); });
    }
  };
  vals.forEach(valor);
  return { text, refs, parts };
}

/** o jogador citado bem no começo da linha (o autor quando não vem nas opções) */
export function autorNoComeco(refs: LogRef[], parts: LogPart[]): PlayerId | null {
  const p0 = parts[0];
  return typeof p0 === 'object' && refs[p0.ref].k === 'jogador' ? refs[p0.ref].id : null;
}

/**
 * Monta e grava uma linha estruturada. `actor`: se não vier, é o jogador citado bem no começo do texto (se houver).
 */
export function reg(g: G, kind: LogKind, opts: Opcoes = {}) {
  return (strings: TemplateStringsArray, ...vals: ValorReg[]): void => {
    const { text, refs, parts } = montar(g, [trecho(strings, ...vals)]);
    const actor = opts.actor === undefined ? autorNoComeco(refs, parts) : opts.actor;
    g.log(text, { ...opts, kind, actor, refs, parts });
  };
}
