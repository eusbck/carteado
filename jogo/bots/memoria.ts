// Memória da Cartomante (fase 9): o que um jogador atento à mesa sabe e deduz, sem nunca olhar o escondido.
//
// - Cartas que voltaram de uma zona pública para a mão de alguém (todos viram) e cartas reveladas que foram para a
//   mão (o registro diz "X revela Y"): ficam marcadas como "na mão" até aparecerem de novo numa zona pública.
// - Leitura do jeito de jogar, no fim do turno de cada oponente: não jogou terreno tendo cartas na mão → provavelmente
//   não tem terreno; passou o turno com dois terrenos ou mais desvirados → provavelmente guarda uma mágica de instante.
// A lista do deck menos o que já saiu é o que o sorteio de bots/mundo.ts já usa para todos os níveis.
// Só lê o que é público: o registro visível, a última informação conhecida de cartas que passaram por zona pública,
// terrenos na mesa e quantidades.

import { controllerOf, isLand } from '../motor/chars.ts';
import type { G } from '../motor/game-context.ts';
import type { PlayerId } from '../motor/types.ts';
import type { InfoOculta } from './mundo.ts';

const PUBLICAS = new Set(['battlefield', 'graveyard', 'exile', 'stack', 'command']);

export interface DadosMemoria {
  /** quantas linhas do registro visível já foram lidas */
  linhas: number;
  /** até onde o registro inteiro já foi lido (ele só cresce): a leitura seguinte começa daqui, sem reler tudo */
  bruto?: number;
  /** a última informação conhecida já foi lida para tudo o que mudou de zona antes deste número de objeto (os objetos
   *  novos ganham números crescentes); antes era a lista de todas as chaves lidas, que crescia a partida inteira */
  lkiAte?: number;
  /** formato antigo (lista das chaves lidas): só numa memória de antes da leitura incremental, e some na próxima leitura */
  lki?: number[];
  naMao: Record<number, string[]>;
  semTerreno: Record<number, number>;
  truque: Record<number, number>;
  /** turno em andamento visto pela última vez, e o que o jogador ativo fez nele */
  turno: { numero: number; ativo: number; terrenos: number; mao: number; desvirados: number; magias: number; proximoId: number };
}

export function memoriaVazia(): DadosMemoria {
  return { linhas: 0, bruto: 0, lkiAte: 0, naMao: {}, semTerreno: {}, truque: {}, turno: { numero: -1, ativo: -1, terrenos: 0, mao: 0, desvirados: 0, magias: 0, proximoId: 0 } };
}

function tirar(lista: string[] | undefined, nome: string): void {
  if (!lista) return;
  const i = lista.indexOf(nome);
  if (i >= 0) lista.splice(i, 1);
}

/** atualiza a memória com o que mudou na mesa desde a última vez (só informação pública; só o que é novo) */
export function observar(m: DadosMemoria, g: G, eu: PlayerId): void {
  const s = g.state;
  const visivel = (e: G['state']['log'][number]) => e.visibleTo === null || e.visibleTo.includes(eu);
  // 1. registro visível, só as linhas novas: revelações ("Fulano revela A, B.")
  let i = m.bruto;
  if (i === undefined) {
    // memória antiga: acha no registro inteiro a posição da última linha visível lida
    i = 0;
    for (let vistas = 0; i < s.log.length && vistas < m.linhas; i++) if (visivel(s.log[i])) vistas++;
  }
  // registro mais curto que o lido (partida refeita até antes, no desfazer): recomeça do fim
  if (i > s.log.length) i = s.log.length;
  const revelados = new Map<PlayerId, string[]>();
  for (; i < s.log.length; i++) {
    const e = s.log[i];
    if (!visivel(e)) continue;
    m.linhas++;
    const r = /^(.+?) revela (.+)\.$/.exec(e.text);
    if (!r) continue;
    const p = s.players.find((x) => x.name === r[1]);
    if (!p || p.id === eu) continue;
    revelados.set(p.id, [...(revelados.get(p.id) ?? []), ...r[2].split(', ')]);
  }
  m.bruto = s.log.length;
  // 2. cartas que passaram por zona pública (o nome é público) e quantas cartas escondidas foram para a mão: só as
  //    mudanças de zona novas (o objeto novo tem número a partir do da última leitura)
  const desde = m.lkiAte ?? 0;
  const lidas = m.lki ? new Set(m.lki) : null;
  const paraMao = new Map<PlayerId, number>();
  for (const [k, v] of Object.entries(s.lki)) {
    if (v.newZone === null || v.newId === null) continue;
    if (lidas ? lidas.has(Number(k)) : v.newId < desde) continue;
    const de = v.obj;
    const dono = de.owner;
    if (dono === eu) continue;
    const novo = s.objects[v.newId];
    const origemPublica = PUBLICAS.has(de.zone) && !de.faceDown;
    const destinoPublico = PUBLICAS.has(v.newZone) && !novo?.faceDown;
    const nome = de.copyOf?.def ?? de.def;
    if (origemPublica && v.newZone === 'hand') (m.naMao[dono] ??= []).push(nome);
    else if (de.zone === 'hand' && destinoPublico) tirar(m.naMao[dono], nome);
    else if (de.zone === 'library' && destinoPublico) tirar(revelados.get(dono), nome);
    else if (de.zone === 'library' && v.newZone === 'hand') paraMao.set(dono, (paraMao.get(dono) ?? 0) + 1);
  }
  m.lkiAte = s.nextId;
  delete m.lki;
  // revelada e posta na mão: entra na memória (sem olhar qual objeto escondido é; só quantas foram para a mão)
  for (const [p, nomes] of revelados) {
    const n = Math.min(nomes.length, paraMao.get(p) ?? 0);
    for (const nome of nomes.slice(0, n)) (m.naMao[p] ??= []).push(nome);
  }
  // a mão encolheu abaixo do que se sabe: algo saiu sem aparecer (raro); corta
  for (const p of s.players) {
    const l = m.naMao[p.id];
    if (l && l.length > s.zones.hand[p.id].length) l.splice(s.zones.hand[p.id].length);
  }
  // 3. leitura do jeito de jogar, no fim do turno de cada oponente
  const t = m.turno;
  if (t.numero !== s.turn.number) {
    if (t.numero >= 0 && t.ativo !== eu && s.players[t.ativo]) {
      const q = t.ativo;
      if (t.terrenos === 0 && t.mao > 0) m.semTerreno[q] = t.proximoId; else delete m.semTerreno[q];
      // passou o próprio turno sem conjurar nada, com mana sobrando e cartas na mão: guarda algo para o turno dos outros
      if (t.magias === 0 && t.desvirados >= 2 && t.mao > 0) m.truque[q] = t.proximoId; else delete m.truque[q];
    }
    m.turno = { numero: s.turn.number, ativo: s.turn.active, terrenos: 0, mao: 0, desvirados: 0, magias: 0, proximoId: 0 };
  }
  const a = s.turn.active;
  if (a !== eu) {
    m.turno.terrenos = Math.max(m.turno.terrenos, s.turn.landsPlayed);
    m.turno.magias = Math.max(m.turno.magias, s.turnStats[a]?.spellsCast ?? 0);
    m.turno.mao = s.zones.hand[a].length;
    m.turno.desvirados = s.zones.battlefield.filter((id) => !s.objects[id].tapped && isLand(g, id) && controllerOf(g, id) === a).length;
    m.turno.proximoId = s.nextId;
  }
}

export function infoDaMemoria(m: DadosMemoria): InfoOculta {
  return { naMao: m.naMao, semTerreno: m.semTerreno, truque: m.truque };
}
