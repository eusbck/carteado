// Onda B (estudo do Arena, registro R2): o redator. Cada lote de eventos do `emit` (triggers.ts) vira linhas do
// registro com o que o motor não escrevia: compras, mortes e destruições, saídas do campo, vida ganha e perdida fora do
// combate, dano fora do combate, fichas criadas, gatilhos indo para a pilha e resoluções depois de respostas.
//
// Só roda com `config.registroDetalhado` (a sala liga; os testes e as cópias dos bots ficam sem). Está na configuração,
// e não no diário, para a partida refeita pelas entradas (desfazer, servidor reiniciado) gravar as mesmas linhas.
//
// Sem spam:
//  - o mesmo lote vira uma linha por assunto ("Zombie ×3 morrem", "Pestilence causa 1 de dano a A, B, C");
//  - compras, fichas, vida e gatilhos do mesmo momento se somam na linha anterior igual (`grupo`), mesmo com outras
//    linhas do redator no meio ("Ana compra 3 cartas", "Ana ganha 5 de vida com Soul Warden (5 vezes)");
//  - a resolução só aparece quando algo aconteceu entre a jogada e ela (alguém respondeu);
//  - nada antes da 1ª rodada (mão inicial e mulligans têm as linhas deles).
// Visibilidade: a compra cita as cartas só para quem comprou (os outros leem "Ana compra 2 cartas."); uma linha que
// cita carta que nem todos veem fica só para quem vê, com um texto sem a carta para os outros.

import { nameOf } from './chars.ts';
import { motivoDaZona, type MotivoZona } from './diario.ts';
import type { GameEvent } from './events.ts';
import type { G } from './game-context.ts';
import { jog, lista, montar, obj, autorNoComeco, type ValorReg } from './registro.ts';
import type { GrupoRegistro, LogEntry, LogKind, ObjId, PlayerId, TargetRef } from './types.ts';

type Ev<T extends GameEvent['type']> = Extract<GameEvent, { type: T }>;

/** quantas linhas do redator, para trás, uma linha nova pode procurar a igual para somar */
const OLHAR_PARA_TRAS = 8;

/** motivos de saída do campo que viram linha, com o tipo da linha */
const SAIDAS: Partial<Record<MotivoZona, LogKind>> = {
  morrer: 'morte', destruir: 'morte', sacrificar: 'morte', legenda: 'morte',
  exilar: 'zona', devolver: 'zona', grimorio: 'zona', comandante: 'zona',
};

/** chamado por `emit` com cada lote (depois do diário) */
export function redigirLote(g: G, events: GameEvent[]): void {
  if (!g.state.config.registroDetalhado || g.state.turn.number === 0) return;
  const motivo = motivosDoLote(g, events);

  // compras: uma linha por jogador
  const compras = new Map<PlayerId, Ev<'draw'>[]>();
  for (const e of events) if (e.type === 'draw') compras.set(e.player, [...(compras.get(e.player) ?? []), e]);
  for (const [p, evs] of compras) somar(g, 'compra', p, evs.map((e) => e.obj), evs.map((e) => nomeSeguro(g, e.obj)), evs.length, null);

  // gatilhos indo para a pilha: uma linha por controlador
  const gatilhos = new Map<PlayerId, Ev<'triggerOnStack'>[]>();
  for (const e of events) if (e.type === 'triggerOnStack') gatilhos.set(e.controller, [...(gatilhos.get(e.controller) ?? []), e]);
  for (const [p, evs] of gatilhos) somar(g, 'gatilho', p, evs.map((e) => e.source), evs.map((e) => nomeSeguro(g, e.source)), evs.length, null);

  // fichas criadas: uma linha por controlador
  const fichas = new Map<PlayerId, Ev<'token'>[]>();
  for (const e of events) if (e.type === 'token') fichas.set(e.player, [...(fichas.get(e.player) ?? []), e]);
  for (const [p, evs] of fichas) somar(g, 'ficha', p, evs.map((e) => e.obj), evs.map((e) => nomeSeguro(g, e.obj)), evs.length, null);

  // saídas do campo, pelo motivo (o ajuste manual já tem a linha dele)
  const saidas = new Map<MotivoZona, Ev<'zone'>[]>();
  for (const e of events) {
    if (e.type !== 'zone' || e.from !== 'battlefield' || e.cause === 'manual') continue;
    const m = motivo(e);
    if (SAIDAS[m]) saidas.set(m, [...(saidas.get(m) ?? []), e]);
  }
  for (const [m, evs] of saidas) linhaDeSaida(g, m, evs);

  // dano fora do combate (o de combate já tem a linha "Dano de combate"): por fonte e quantidade
  const danos = events.filter((e): e is Ev<'damage'> => e.type === 'damage' && !e.combat);
  linhaDeDano(g, danos);

  // vida: a perda que veio de dano do mesmo lote já está contada no dano
  const porDano = new Set(events.filter((e): e is Ev<'damage'> => e.type === 'damage' && e.target.kind === 'player').map((e) => `${e.target.id}:${e.source}`));
  const perdas = events.filter((e): e is Ev<'lifeLoss'> => e.type === 'lifeLoss' && !porDano.has(`${e.player}:${e.source}`) && e.amount > 0);
  // a mesma fonte tirando o mesmo tanto de vários jogadores ("cada oponente perde 1"): uma linha só
  const drenos = new Map<string, Ev<'lifeLoss'>[]>();
  for (const e of perdas) drenos.set(`${e.source}:${e.amount}`, [...(drenos.get(`${e.source}:${e.amount}`) ?? []), e]);
  for (const evs of drenos.values()) {
    if (evs.length > 1) linhaDeDreno(g, evs);
    else somar(g, 'perde', evs[0].player, [], [], evs[0].amount, evs[0].source);
  }
  for (const e of events) if (e.type === 'lifeGain' && e.amount > 0) somar(g, 'ganha', e.player, [], [], e.amount, e.source);
}

/** o motivo de cada troca de zona: o do diário quando ligado (ele tem as dicas do motor), senão pelos irmãos do lote */
function motivosDoLote(g: G, events: GameEvent[]): (e: Ev<'zone'>) => MotivoZona {
  const doDiario = new Map<GameEvent, MotivoZona>();
  const d = g.diario;
  if (d) for (let i = d.entradas.length - 1; i >= 0 && i >= d.entradas.length - events.length; i--) {
    const e = d.entradas[i];
    if (e.motivo) doDiario.set(e.ev, e.motivo);
  }
  return (e) => doDiario.get(e) ?? motivoDaZona(e, events, g);
}

/** nome de um objeto que pode já ter saído (LKI) */
function nomeSeguro(g: G, id: ObjId): string {
  if (g.state.objects[id]) return nameOf(g, id);
  const l = g.state.lki[id];
  return l?.chars.name || 'carta virada para baixo';
}

/**
 * "A, B ×2 e C": cada nome uma vez (a ref é a primeira cópia), com a contagem quando repete. Com vírgula num nome
 * ("Terra, Herald of Hope"), os itens se separam por ponto e vírgula.
 */
function nomesAgrupados(ids: ObjId[], nomes: string[], papel?: 'vitima' | 'fonte'): ValorReg {
  const ordem: { id: ObjId; nome: string; n: number }[] = [];
  nomes.forEach((nome, i) => {
    const x = ordem.find((o) => o.nome === nome);
    if (x) x.n++; else ordem.push({ id: ids[i], nome, n: 1 });
  });
  const sep = ordem.some((o) => o.nome.includes(',')) ? '; ' : ', ';
  const vals: ValorReg[] = [];
  ordem.forEach((o, i) => {
    if (i) vals.push(i === ordem.length - 1 ? ' e ' : sep);
    vals.push(obj(o.id, papel, o.nome));
    if (o.n > 1) vals.push(` ×${o.n}`);
  });
  return lista(vals, '');
}

const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios);

/** grava a linha, com a versão sem cartas escondidas para quem não as vê */
function gravar(g: G, kind: LogKind, vals: ValorReg[], o: { rule?: string; actor?: PlayerId | null; grupo?: GrupoRegistro; visibleTo?: PlayerId[]; hiddenText?: string; substituir?: LogEntry }): void {
  const { text, refs, parts } = montar(g, vals);
  let visibleTo = o.visibleTo ?? null;
  let hiddenText = o.hiddenText;
  if (!visibleTo) {
    // carta escondida (na mão, no grimório) citada pelo nome: a linha fica para quem via todas. A virada para baixo no
    // campo aparece como "carta virada para baixo" e a que saiu do campo é citada como estava lá (pública); nelas a
    // vista já tira a def de quem não via
    const escondida = (id: ObjId) => {
      const z = (g.state.objects[id] ?? g.state.lki[id]?.obj)?.zone;
      return z === 'hand' || z === 'library';
    };
    const restritas = refs.filter((r) => r.k === 'obj' && r.vis !== null && escondida(r.id));
    if (restritas.length) {
      const todos = g.state.players.map((p) => p.id);
      visibleTo = todos.filter((p) => restritas.every((r) => r.k === 'obj' && r.vis!.includes(p)));
      hiddenText = o.hiddenText ?? textoOculto(g, kind, o.actor ?? null);
    }
  }
  const actor = o.actor === undefined ? autorNoComeco(refs, parts) : o.actor;
  const grupo = o.grupo ?? { chave: `${kind}:${g.state.log.length}`, ids: [], nomes: [], n: 0, vezes: 1 };
  if (o.substituir) {
    const e = o.substituir;
    e.text = text; e.refs = refs.length ? refs : undefined; e.parts = parts.length ? parts : undefined;
    e.visibleTo = visibleTo; e.hiddenText = hiddenText; e.grupo = grupo;
    if (!e.refs) delete e.refs;
    if (!e.parts) delete e.parts;
    if (e.hiddenText === undefined) delete e.hiddenText;
    return;
  }
  g.log(text, { kind, actor, refs, parts, visibleTo, ...(hiddenText !== undefined ? { hiddenText } : {}), ...(o.rule ? { rule: o.rule } : {}), grupo });
}

/** o texto de uma linha com carta escondida, para quem não a vê */
function textoOculto(g: G, kind: LogKind, actor: PlayerId | null): string {
  const quem = actor !== null ? `${g.state.players[actor]?.name ?? '?'}: ` : '';
  return kind === 'gatilho' ? `${quem}habilidade de uma carta escondida vai para a pilha.` : `${quem}algo acontece com uma carta escondida.`;
}

type Somavel = 'compra' | 'gatilho' | 'ficha' | 'ganha' | 'perde';

/**
 * Linha que se soma com a igual anterior do mesmo momento (mesmo turno e etapa, só linhas do redator no meio: escolher o
 * alvo de cada gatilho é uma entrada, mas ninguém jogou nada), procurando entre as últimas linhas do redator.
 * `fonte`: de onde veio a vida (fica enquanto for a mesma).
 */
function somar(g: G, tipo: Somavel, p: PlayerId, ids: ObjId[], nomes: string[], n: number, fonte: ObjId | null): void {
  const chave = `${tipo}:${p}`;
  const s = g.state;
  let anterior: LogEntry | undefined;
  for (let i = s.log.length - 1; i >= 0 && i >= s.log.length - OLHAR_PARA_TRAS; i--) {
    const e = s.log[i];
    if (!e.grupo || e.turn !== s.turn.number || e.step !== s.turn.step) break;
    if (e.grupo.chave === chave) { anterior = e; break; }
  }
  const grupo: GrupoRegistro = anterior?.grupo
    ? { chave, ids: [...anterior.grupo.ids, ...ids], nomes: [...anterior.grupo.nomes, ...nomes], n: anterior.grupo.n + n, vezes: anterior.grupo.vezes + 1, fonte: anterior.grupo.fonte === fonte ? fonte : null }
    : { chave, ids, nomes, n, vezes: 1, fonte };
  const nome = s.players[p]?.name ?? '?';
  const subst = anterior ? { substituir: anterior } : {};
  switch (tipo) {
    case 'compra': {
      const cartas = `${grupo.n} ${plural(grupo.n, 'carta', 'cartas')}`;
      gravar(g, 'compra', [jog(p), ' compra ', nomesAgrupados(grupo.ids, grupo.nomes), '.'], { rule: '121.1', actor: p, grupo, visibleTo: [p], hiddenText: `${nome} compra ${cartas}.`, ...subst });
      return;
    }
    case 'gatilho': {
      const varios = grupo.n > 1;
      gravar(g, 'gatilho', [jog(p), varios ? ': gatilhos de ' : ': gatilho de ', nomesAgrupados(grupo.ids, grupo.nomes, 'fonte'), varios ? ' vão para a pilha.' : ' vai para a pilha.'], { rule: '603.3', actor: p, grupo, ...subst });
      return;
    }
    case 'ficha': {
      const nomesDistintos = new Set(grupo.nomes);
      const vals: ValorReg[] = nomesDistintos.size === 1
        ? [jog(p), grupo.n === 1 ? ' cria uma ficha ' : ` cria ${grupo.n} fichas `, obj(grupo.ids[0], undefined, grupo.nomes[0]), '.']
        : [jog(p), ` cria ${grupo.n} fichas: `, nomesAgrupados(grupo.ids, grupo.nomes), '.'];
      gravar(g, 'ficha', vals, { rule: '111.1', actor: p, grupo, ...subst });
      return;
    }
    case 'ganha':
    case 'perde': {
      const fonteVal: ValorReg[] = grupo.fonte != null && (s.objects[grupo.fonte] || s.lki[grupo.fonte]) ? [' com ', obj(grupo.fonte, 'fonte', nomeSeguro(g, grupo.fonte))] : [];
      const vezes = grupo.vezes > 1 ? `${grupo.vezes} vezes; ` : '';
      const verbo = tipo === 'ganha' ? ' ganha ' : ' perde ';
      gravar(g, 'vida', [jog(p, tipo === 'perde' ? 'vitima' : undefined), verbo, `${grupo.n} de vida`, ...fonteVal, ` (${vezes}agora ${s.players[p].life}).`], { rule: '119.3', actor: p, grupo, ...subst });
      return;
    }
  }
}

/** "X morre." / "Zombie ×3 morrem." / "Ana sacrifica X e Y." */
function linhaDeSaida(g: G, m: MotivoZona, evs: Ev<'zone'>[]): void {
  const s = g.state;
  const kind = SAIDAS[m]!;
  // a carta como estava no campo (LKI): o nome e quem a controlava
  const ids = evs.map((e) => (s.lki[e.old] ? e.old : e.obj));
  const nomes = ids.map((id, i) => s.lki[id]?.chars.name || (s.objects[evs[i].obj] ? nameOf(g, evs[i].obj) : 'carta virada para baixo'));
  const ctl = (id: ObjId, i: number) => s.lki[id]?.chars.controller ?? evs[i].controller;
  const varios = evs.length > 1;
  if (m === 'sacrificar') {
    // um grupo por quem sacrificou
    const por = new Map<PlayerId, number[]>();
    ids.forEach((id, i) => por.set(ctl(id, i), [...(por.get(ctl(id, i)) ?? []), i]));
    for (const [p, is] of por) gravar(g, 'morte', [jog(p), ' sacrifica ', nomesAgrupados(is.map((i) => ids[i]), is.map((i) => nomes[i]), 'vitima'), '.'], { rule: '701.21a', actor: p });
    return;
  }
  const quem = nomesAgrupados(ids, nomes, 'vitima');
  const actor = null;
  const fim: Partial<Record<MotivoZona, [string, string, string?]>> = {
    morrer: [' morre.', ' morrem.'],
    destruir: [' é destruída.', ' são destruídas.', '701.8a'],
    legenda: [' vai para o cemitério (regra da lenda).', ' vão para o cemitério (regra da lenda).', '704.5j'],
    exilar: [' é exilada.', ' são exiladas.'],
    grimorio: [' vai para o grimório.', ' vão para o grimório.'],
    comandante: [' vai para a zona de comando.', ' vão para a zona de comando.', '903.9a'],
  };
  if (m === 'devolver') {
    const dono = evs.every((e) => e.owner === evs[0].owner) ? evs[0].owner : null;
    gravar(g, kind, [quem, varios ? ' voltam para a mão' : ' volta para a mão', ...(dono !== null ? [' de ', jog(dono)] : []), '.'], { actor });
    return;
  }
  const f = fim[m];
  if (!f) return;
  gravar(g, kind, [quem, varios ? f[1] : f[0]], { actor, ...(f[2] ? { rule: f[2] } : {}) });
}

/** dano fora do combate: uma linha por lote, cada fonte com a quantidade e quem recebeu */
function linhaDeDano(g: G, danos: Ev<'damage'>[]): void {
  if (!danos.length) return;
  const s = g.state;
  const grupos = new Map<string, Ev<'damage'>[]>();
  for (const e of danos) grupos.set(`${e.source}:${e.amount}`, [...(grupos.get(`${e.source}:${e.amount}`) ?? []), e]);
  const alvoVal = (t: TargetRef): ValorReg => (t.kind === 'player'
    ? lista([jog(t.id, 'vitima'), ` (agora ${s.players[t.id].life})`], '')
    : obj(t.id, 'vitima', nomeSeguro(g, t.id)));
  const trechos: ValorReg[] = [...grupos.values()].map((evs) => lista([obj(evs[0].source, 'fonte', nomeSeguro(g, evs[0].source)), ` causa ${evs[0].amount} de dano a `, lista(evs.map((e) => alvoVal(e.target)))], ''));
  const ctls = new Set(danos.map((e) => e.controller));
  gravar(g, 'dano', [lista(trechos, '; '), '.'], { rule: '120.3', actor: ctls.size === 1 ? danos[0].controller : null });
}

/** "Bruno, Caio e Dani perdem 1 de vida com X." */
function linhaDeDreno(g: G, evs: Ev<'lifeLoss'>[]): void {
  const s = g.state;
  const fonte = evs[0].source;
  const fonteVal: ValorReg[] = fonte !== null && (s.objects[fonte] || s.lki[fonte]) ? [' com ', obj(fonte, 'fonte', nomeSeguro(g, fonte))] : [];
  gravar(g, 'vida', [lista(evs.map((e) => lista([jog(e.player, 'vitima'), ` (${s.players[e.player].life})`], ''))), ` perdem ${evs[0].amount} de vida cada`, ...fonteVal, '.'], { rule: '119.3', actor: null });
}

/**
 * Começo da resolução (CR 608.1; chamado por stack.ts). Só vira linha quando alguém jogou algo entre a jogada que pôs o
 * objeto na pilha e agora: olhando para trás, as linhas do próprio redator (gatilhos, vida…) não contam, e a primeira
 * outra linha é a da própria jogada (conjura, ativa) quando ninguém respondeu.
 */
export function redigirResolucao(g: G, id: ObjId): void {
  const s = g.state;
  if (!s.config.registroDetalhado || s.turn.number === 0) return;
  const st = s.objects[id]?.stack;
  if (!st) return;
  const habilidade = st.kind !== 'spell';
  const fonte = habilidade ? (st.source ?? null) : id;
  if (fonte === null) return;
  for (let i = s.log.length - 1; i >= 0 && i >= s.log.length - 3 * OLHAR_PARA_TRAS; i--) {
    const e = s.log[i];
    if (e.refs?.some((r) => r.k === 'obj' && (r.id === id || r.id === fonte))) return;
    if (!e.grupo) break;
  }
  const nome = nomeSeguro(g, fonte);
  const vals: ValorReg[] = habilidade ? ['A habilidade de ', obj(fonte, 'fonte', nome), ' resolve.'] : [obj(id, 'fonte', nome), ' resolve.'];
  gravar(g, 'resolve', vals, { rule: '608.2', actor: st.controller });
}
