// F3 (estudo do Arena, registro R1): linhas do registro com estrutura. Cada linha guarda o tipo (`kind`), quem fez
// (`actor`), as cartas e jogadores citados (`refs`) e o texto em pedaços (`parts`, literais e {ref: n}). O `text`
// continua igual ao de antes (a busca, o desfazer, os bots e os testes leem o texto).
//
// Uso, com template marcado:
//   reg(g, 'conjura', { rule: '601.2' })`${jog(p)} conjura ${obj(id)}.`
//   reg(g, 'revela', { rule: '701.20' })`${jog(p)} revela ${objs(ids)}.`   (lista separada por ", ")
// Valores que não são ref (string, número) entram como texto literal.

import { nameOf } from './chars.ts';
import type { G } from './game-context.ts';
import type { LogEntry, LogKind, LogPapel, LogPart, LogRef, ObjId, PlayerId } from './types.ts';
import { quemVe } from './view.ts';

interface RefJogador { readonly __reg: 'jogador'; id: PlayerId; papel?: LogPapel }
interface RefObj { readonly __reg: 'obj'; id: ObjId; papel?: LogPapel; nome?: string }
interface RefLista { readonly __reg: 'lista'; ids: ObjId[]; papel?: LogPapel; sep: string; vazio: string }
export type ValorReg = RefJogador | RefObj | RefLista | string | number;

/** um jogador citado (o nome sai de `players[id].name`) */
export const jog = (id: PlayerId, papel?: LogPapel): RefJogador => ({ __reg: 'jogador', id, papel });
/** uma carta citada (o nome sai de `nameOf`, como nos textos de antes; `nome` troca o texto mostrado) */
export const obj = (id: ObjId, papel?: LogPapel, nome?: string): RefObj => ({ __reg: 'obj', id, papel, nome });
/** várias cartas, separadas por `sep` (", " por padrão); `vazio` é o texto quando a lista é vazia */
export const objs = (ids: ObjId[], papel?: LogPapel, sep = ', ', vazio = ''): RefLista => ({ __reg: 'lista', ids, papel, sep, vazio });

type Opcoes = Partial<Pick<LogEntry, 'rule' | 'visibleTo' | 'hiddenText' | 'actor'>>;

/**
 * Monta e grava uma linha estruturada. `actor`: se não vier, é o jogador citado bem no começo do texto (se houver).
 */
export function reg(g: G, kind: LogKind, opts: Opcoes = {}) {
  return (strings: TemplateStringsArray, ...vals: ValorReg[]): void => {
    const refs: LogRef[] = [];
    const parts: LogPart[] = [];
    let text = '';
    const lit = (s: string) => {
      if (!s) return;
      text += s;
      const ult = parts[parts.length - 1];
      if (typeof ult === 'string') parts[parts.length - 1] = ult + s; else parts.push(s);
    };
    const refObj = (id: ObjId, papel?: LogPapel, nome?: string) => {
      const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
      const n = nome ?? nameOf(g, id);
      refs.push({ k: 'obj', id, card: o?.card ?? null, name: n, ...(papel ? { papel } : {}), vis: o ? quemVe(g, o) : null });
      parts.push({ ref: refs.length - 1 });
      text += n;
    };
    strings.forEach((s, i) => {
      lit(s);
      if (i >= vals.length) return;
      const v = vals[i];
      if (typeof v === 'string' || typeof v === 'number') { lit(String(v)); return; }
      if (v.__reg === 'jogador') {
        refs.push({ k: 'jogador', id: v.id, ...(v.papel ? { papel: v.papel } : {}) });
        parts.push({ ref: refs.length - 1 });
        text += g.state.players[v.id]?.name ?? '?';
      } else if (v.__reg === 'obj') refObj(v.id, v.papel, v.nome);
      else {
        if (!v.ids.length) lit(v.vazio);
        v.ids.forEach((id, k) => { if (k) lit(v.sep); refObj(id, v.papel); });
      }
    });
    let actor = opts.actor;
    if (actor === undefined) {
      const p0 = parts[0];
      actor = typeof p0 === 'object' && refs[p0.ref].k === 'jogador' ? refs[p0.ref].id : null;
    }
    g.log(text, { ...opts, kind, actor, refs, parts });
  };
}
