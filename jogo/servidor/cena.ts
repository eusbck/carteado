// F2 (estudo do Arena, eventos 2 e protocolo 1): redige o diário do motor (motor/diario.ts) para um assento. Módulo
// puro: recebe as entradas e devolve os eventos de cena que aquele assento pode saber, na mesma ordem.
//
// Regras (relatório 1-eventos, 3.2):
// - R1: nunca CardId nem def. A identidade vem da vista, que já passa por canSee; aqui só há ids de objeto.
// - R2: um id só vai a quem via o objeto NAQUELA encarnação, pelo `vis` que o motor calculou no emit (o objeto antigo
//   de uma troca de zona só existe no LKI depois). Objeto sem `vis` não sai (negar é o padrão).
// - R3: movimento entre zonas escondidas do assento vira contagem: os lados vão sem id.
// - R4: nenhum id de objeto no grimório, para ninguém (embaralhar mantém os ids: um id mandado uma vez seguiria a
//   carta depois). Quem compra recebe o id da carta na mão, que basta para a animação.
// - Prioridade e passe não viram evento (vazariam paradas e passe automático); `sacrifice` sozinho é motivo da zona.
// - Lista branca por tipo: evento do motor que não está aqui não sai.
// - O id de um objeto numa zona pública (campo, pilha, cemitério, exílio, comando) vai a todos, como na vista, mesmo
//   virado para baixo (a identidade continua só na vista, que passa por canSee): `publico` (idPublicoNoJogo) diz isso.

import type { EntradaDiario } from '../motor/diario.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId, PlayerId, TargetRef, ZoneName } from '../motor/types.ts';
import type { AlvoCena, EventoCena, LadoZona } from './protocolo.ts';

/** mais do que isto numa mensagem vira salto (o cliente só desenha a vista) */
export const TETO_CENA = 60;

const ZONAS_PUBLICAS: ReadonlySet<ZoneName> = new Set(['battlefield', 'stack', 'graveyard', 'exile', 'command']);

/**
 * se o id do objeto é público (a vista o mostra a todos): ele está, ou estava ao sair (LKI), numa zona pública. Vale
 * olhar depois do evento porque um ObjId nunca passa de uma zona escondida a uma pública (toda troca de zona cria um id
 * novo, moveRaw; só o mulligan move ids, e da mão para o grimório). Objeto que nem existe nem ficou no LKI: não.
 */
export function idPublicoNoJogo(g: G): (id: ObjId) => boolean {
  return (id) => {
    const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
    return !!o && ZONAS_PUBLICAS.has(o.zone);
  };
}

/** os eventos de cena de `entradas` que o `assento` pode saber (null: espectador, só o público). `publico`: ids que a
 * vista mostra a todos (idPublicoNoJogo); sem ele, só o `vis` de cada entrada */
export function eventosPara(assento: PlayerId | null, entradas: readonly EntradaDiario[], publico?: (id: ObjId) => boolean): EventoCena[] {
  const out: EventoCena[] = [];
  for (const e of entradas) {
    const r = redigir(assento, e, publico);
    if (r) out.push({ seq: e.seq, lote: e.lote, ...r } as EventoCena);
  }
  return out;
}

/** o evento sem seq e lote (redigir monta; eventosPara acrescenta os dois) */
type Corpo = EventoCena extends infer T ? (T extends EventoCena ? Omit<T, 'seq' | 'lote'> : never) : never;

function redigir(assento: PlayerId | null, e: EntradaDiario, publico?: (id: ObjId) => boolean): Corpo | null {
  /** o id, se o assento via o objeto quando o evento aconteceu (ou se o objeto está numa zona pública) */
  const ver = (id: ObjId | null | undefined): ObjId | undefined => {
    if (id === null || id === undefined) return undefined;
    const v = e.vis[id];
    if (v === 'all' || publico?.(id)) return id;
    return assento !== null && Array.isArray(v) && v.includes(assento) ? id : undefined;
  };
  /** `{ [k]: id }` só se o assento o via */
  const campo = <K extends string>(k: K, id: ObjId | null | undefined): Partial<Record<K, ObjId>> => {
    const x = ver(id);
    return x === undefined ? {} : ({ [k]: x } as Record<K, ObjId>);
  };
  const alvo = (t: TargetRef): AlvoCena => (t.kind === 'player' ? { jogador: t.id } : campo('id', t.id));
  const ev = e.ev;
  switch (ev.type) {
    case 'step':
      return { tipo: 'passo', etapa: ev.step, ativo: ev.active, ...(ev.firstMain ? { primeiraPrincipal: true as const } : {}) };
    case 'zone': {
      // R4: o lado no grimório nunca leva id
      const de: LadoZona = { ...(ev.from === 'library' ? {} : campo('id', ev.old)), zona: ev.from, dono: ev.owner };
      const para: LadoZona = { ...(ev.to === 'library' ? {} : campo('id', ev.obj)), zona: ev.to, dono: ev.owner };
      return { tipo: 'zona', de, para, motivo: e.motivo ?? 'outro', controlador: ev.controller, ...(ev.token ? { ficha: true as const } : {}), ...(ev.by !== undefined ? { por: ev.by } : {}) };
    }
    case 'cast':
      return { tipo: 'conjurar', ...campo('id', ev.obj), jogador: ev.player, de: ev.from, ...(ev.copy ? { copia: true as const } : {}) };
    case 'copySpell':
      return { tipo: 'copiar', ...campo('id', ev.obj), jogador: ev.player };
    case 'activate':
      // sem abilityId: o nome da habilidade diria qual é a carta de uma fonte virada para baixo
      return { tipo: 'ativar', ...campo('id', ev.obj), ...campo('fonte', ev.source), jogador: ev.player };
    case 'triggerOnStack':
      return { tipo: 'gatilho', ...campo('id', ev.obj), ...campo('fonte', ev.source), controlador: ev.controller };
    case 'target':
      return { tipo: 'alvo', alvo: alvo(ev.target), ...campo('fonte', ev.by), controlador: ev.controller, magica: ev.spell };
    case 'resolved':
      return { tipo: 'resolver', ...campo('id', ev.obj), controlador: ev.controller };
    case 'draw':
      return { tipo: 'comprar', jogador: ev.player, ...campo('id', ev.obj), n: ev.nth };
    case 'discard':
      return { tipo: 'descartar', jogador: ev.player, ...campo('id', ev.obj) };
    case 'mill':
      return { tipo: 'moer', jogador: ev.player, ids: ev.objs.map(ver).filter((x): x is ObjId => x !== undefined), n: ev.objs.length };
    case 'shuffle':
      return { tipo: 'embaralhar', jogador: ev.player };
    case 'search':
      return { tipo: 'buscar', jogador: ev.player, grimorio: ev.library };
    case 'scry':
      return { tipo: 'olhar', jogador: ev.player, n: ev.n, como: 'videncia' };
    case 'surveil':
      return { tipo: 'olhar', jogador: ev.player, n: ev.n, como: 'vigiar' };
    case 'attackers':
      return { tipo: 'atacantes', jogador: ev.player, ataques: ev.attackers.map((a) => ({ ...campo('id', a.obj), alvo: alvo(a.target) })) };
    case 'blockers':
      return { tipo: 'bloqueadores', bloqueios: ev.blocks.map(([b, a]) => [ver(b) ?? null, ver(a) ?? null] as [ObjId | null, ObjId | null]) };
    case 'damage':
      return { tipo: 'dano', ...campo('fonte', ev.source), controlador: ev.controller, alvo: alvo(ev.target), quantidade: ev.amount, combate: ev.combat };
    case 'damagePrevented':
      return { tipo: 'dano', ...campo('fonte', ev.source), controlador: ev.controller, alvo: alvo(ev.target), quantidade: ev.amount, combate: ev.combat, prevenido: true };
    // sem abilityId nos três (diria a carta de uma fonte virada para baixo)
    case 'resolving':
      return { tipo: 'resolvendo', ...campo('id', ev.obj), controlador: ev.controller };
    case 'countered':
      return { tipo: 'anulada', ...campo('id', ev.obj), controlador: ev.controller };
    case 'fizzled':
      return { tipo: 'sem-alvos', ...campo('id', ev.obj), controlador: ev.controller };
    case 'lifeGain':
      return { tipo: 'vida', jogador: ev.player, quantidade: ev.amount, ...campo('fonte', ev.source) };
    case 'lifeLoss':
      return { tipo: 'vida', jogador: ev.player, quantidade: -ev.amount, ...campo('fonte', ev.source) };
    case 'counters':
      return { tipo: 'marcadores', alvo: alvo(ev.target), marcador: ev.kind, quantidade: ev.amount, ...(ev.by !== null ? { por: ev.by } : {}) };
    case 'countersRemoved':
      return { tipo: 'marcadores', alvo: alvo(ev.target), marcador: ev.kind, quantidade: -ev.amount };
    case 'tap':
      return { tipo: 'virar', ...campo('id', ev.obj), ...(ev.forMana ? { mana: true as const } : {}) };
    case 'untap':
      return { tipo: 'virar', ...campo('id', ev.obj), desvirar: true };
    case 'mana':
      return { tipo: 'mana', jogador: ev.player, ...campo('fonte', ev.source), cores: [...ev.produced] };
    case 'token':
      return { tipo: 'ficha', ...campo('id', ev.obj), jogador: ev.player };
    case 'transform':
      return { tipo: 'transformar', ...campo('id', ev.obj), face: ev.to };
    case 'turnedFaceUp':
      return { tipo: 'transformar', ...campo('id', ev.obj), revelada: true };
    case 'phaseOut':
      return { tipo: 'fase', ...campo('id', ev.obj), saiu: true };
    case 'phaseIn':
      return { tipo: 'fase', ...campo('id', ev.obj), saiu: false };
    case 'attach':
      return { tipo: 'anexar', ...campo('id', ev.obj), ...campo('a', ev.to) };
    case 'unattach':
      return { tipo: 'anexar', ...campo('id', ev.obj), ...campo('a', ev.from), solto: true };
    case 'controlChange':
      return { tipo: 'controle', ...campo('id', ev.obj), de: ev.from, para: ev.to };
    case 'regenerate':
      return { tipo: 'regenerar', ...campo('id', ev.obj) };
    case 'monarch':
      return { tipo: 'designacao', qual: 'monarca', jogador: ev.player };
    case 'ringTempts':
      return { tipo: 'designacao', qual: 'anel', jogador: ev.player, ...campo('id', ev.bearer) };
    case 'monstrous':
      return { tipo: 'designacao', qual: 'monstruoso', ...campo('id', ev.obj), n: ev.n };
    case 'prepared':
      return { tipo: 'designacao', qual: 'preparado', ...campo('id', ev.obj) };
    case 'crewed':
      return { tipo: 'designacao', qual: 'tripulado', jogador: ev.player, ...campo('id', ev.obj) };
    case 'levelUp':
      return { tipo: 'designacao', qual: 'nivel', ...campo('id', ev.obj), n: ev.level };
    case 'unlock':
      return { tipo: 'designacao', qual: 'destrancar', jogador: ev.player, ...campo('id', ev.obj) };
    case 'manifestDread':
      return { tipo: 'designacao', qual: 'pavor', jogador: ev.player, ...campo('id', ev.obj) };
    case 'connive':
      return { tipo: 'mecanica', qual: 'tramar', jogador: ev.player, ...campo('id', ev.obj), ids: ev.discarded.map(ver).filter((x): x is ObjId => x !== undefined), n: ev.discarded.length };
    case 'amass':
      return { tipo: 'mecanica', qual: 'exercito', jogador: ev.player, ...campo('id', ev.army) };
    case 'clash':
      return { tipo: 'mecanica', qual: 'confronto', jogador: ev.player, venceu: ev.won };
    case 'blight':
      return { tipo: 'mecanica', qual: 'definhar', jogador: ev.player, ...campo('id', ev.creature), n: ev.n };
    case 'leave':
      return { tipo: 'jogador', jogador: ev.player, saiu: true };
    // sacrifício: é o motivo da zona do mesmo lote
    case 'sacrifice':
      return null;
    default: {
      // tipo novo do motor: fica de fora até ganhar regra aqui (lista branca)
      const _novo: never = ev;
      void _novo;
      return null;
    }
  }
}
