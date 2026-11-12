// O combate visto de uma vista para a seguinte (sem DOM, testável): quem acabou de ser declarado atacante e quem golpeou
// no dano de combate (contra os bloqueadores, o jogador ou o planeswalker), com quanto e se morreu. Efeitos.tsx anima
// a partir daqui (impacto.ts).
//
// O dano de combate só vale quando a etapa passou por uma etapa de dano entre as duas vistas (a mágica que dá dano na
// etapa de bloqueadores não vira golpe) e houve dano ou morte de fato. Primeiro golpe e golpe duplo (CR 510.4): na
// etapa de primeiro golpe só golpeiam os que têm um dos dois; na normal, os sem primeiro golpe e os de golpe duplo; as
// duas etapas juntas numa vista só (a sala mandou as duas de uma vez) golpeiam todos uma vez.
//
// Também daqui: quem sai do campo e para onde (planejarSaidas) e a ordem da destruição em massa (ordenarGrupo).

import type { ObjId, PlayerId, Step } from '../../../motor/types.ts';
import type { GameView, ObjView } from '../../../motor/view.ts';

export type AlvoGolpe =
  | { tipo: 'bloqueadores'; ids: ObjId[] }
  | { tipo: 'jogador'; id: PlayerId }
  | { tipo: 'planeswalker'; id: ObjId };

/** atacante recém-declarado e para quem ele vai (o jogador ou o planeswalker/batalha atacado) */
export interface Declarado { id: ObjId; alvo: Exclude<AlvoGolpe, { tipo: 'bloqueadores' }> }

export interface Golpe {
  atacante: ObjId;
  alvo: AlvoGolpe;
  /** o dano do atacante (força, ou resistência para quem atribui por ela): mede o tamanho do golpe na tela */
  dano: number;
  /** o atacante saiu do campo nesta vista (morreu no combate) */
  morreu: boolean;
}

export interface PlanoCombate { declarados: Declarado[]; golpes: Golpe[] }

const ORDEM: Step[] = ['untap', 'upkeep', 'draw', 'main1', 'beginCombat', 'declareAttackers', 'declareBlockers', 'firstStrikeDamage', 'combatDamage', 'endCombat', 'main2', 'end', 'cleanup'];
const PRIMEIRO = ORDEM.indexOf('firstStrikeDamage');
const NORMAL = ORDEM.indexOf('combatDamage');

const alvoDe = (t: { kind: 'obj' | 'player'; id: number }): Declarado['alvo'] => (t.kind === 'player' ? { tipo: 'jogador', id: t.id } : { tipo: 'planeswalker', id: t.id });

/** o dano de combate de uma criatura (CR 510.1a: a resistência para quem atribui por ela) */
export const danoDe = (o: ObjView): number => Math.max(0, o.damageByToughness?.amount ?? o.power ?? 0);

const temPrimeiro = (o: ObjView) => o.keywords.includes('first strike') || o.keywords.includes('double strike');
const temDuplo = (o: ObjView) => o.keywords.includes('double strike');

/** houve dano ou morte entre as duas vistas: vida perdida, dano marcado, lealdade perdida ou criatura/planeswalker que saiu */
function houveDano(a: GameView, v: GameView): boolean {
  const vida = new Map(a.players.map((p) => [p.id, p.life]));
  if (v.players.some((p) => p.life < (vida.get(p.id) ?? p.life))) return true;
  const antes = new Map(a.battlefield.map((o) => [o.id, o]));
  const agora = new Set(v.battlefield.map((o) => o.id));
  for (const o of v.battlefield) {
    const x = antes.get(o.id);
    if (x && (o.damage > x.damage || (o.counters.loyalty ?? 0) < (x.counters.loyalty ?? 0))) return true;
  }
  return a.battlefield.some((o) => !agora.has(o.id) && (o.types.includes('Creature') || o.types.includes('Planeswalker')));
}

export function planejarCombate(a: GameView, v: GameView): PlanoCombate {
  const de = ORDEM.indexOf(a.turn.step);
  const mesmoTurno = v.turn.number === a.turn.number && v.turn.active === a.turn.active;
  // o combate da vista de antes só conta se for o mesmo (não o de um turno anterior nem o de antes de uma fase de
  // combate adicional): quem ataca de novo é declarado de novo
  const mesmoCombate = mesmoTurno && de <= ORDEM.indexOf(v.turn.step);
  const antes = new Set(mesmoCombate ? a.combat?.attackers.map((x) => x.id) : []);
  const declarados: Declarado[] = (v.combat?.attackers ?? []).filter((x) => !antes.has(x.id)).map((x) => ({ id: x.id, alvo: alvoDe(x.target) }));

  // as etapas de dano que ficaram para trás entre as duas vistas (outro turno: todas as que faltavam no de antes)
  const ate = mesmoTurno ? ORDEM.indexOf(v.turn.step) : Infinity;
  const passouPrimeiro = de < PRIMEIRO && ate >= PRIMEIRO;
  const passouNormal = de < NORMAL && ate >= NORMAL;
  const combate = a.combat ?? v.combat;
  if (!combate || !(passouPrimeiro || passouNormal) || !houveDano(a, v)) return { declarados, golpes: [] };

  const noCampo = new Map(a.battlefield.map((o) => [o.id, o]));
  const agora = new Set(v.battlefield.map((o) => o.id));
  // os bloqueios mais recentes que se tem (a vista nova ainda tem o combate na etapa de dano)
  const depois = new Map(v.combat?.attackers.map((x) => [x.id, x]) ?? []);
  const golpes: Golpe[] = [];
  for (const at of combate.attackers) {
    const o = noCampo.get(at.id);
    if (!o) continue;
    const golpeia = (passouPrimeiro && temPrimeiro(o)) || (passouNormal && (!temPrimeiro(o) || temDuplo(o)));
    const dano = danoDe(o);
    if (!golpeia || dano <= 0) continue;
    const x = depois.get(at.id) ?? at;
    const bloqueado = at.blocked || x.blocked;
    const bloqueadores = (x.blockers.length ? x.blockers : at.blockers).filter((b) => noCampo.has(b));
    let alvo: AlvoGolpe;
    if (bloqueadores.length) alvo = { tipo: 'bloqueadores', ids: bloqueadores };
    else if (bloqueado) continue; // bloqueado e os bloqueadores já saíram: não causa dano (sem atropelar)
    else alvo = alvoDe(at.target);
    golpes.push({ atacante: at.id, alvo, dano, morreu: !agora.has(at.id) });
  }
  // atacante e dano juntos numa vista só (a sala pulou a vista do ataque): fica só o golpe
  return { declarados: golpes.length ? [] : declarados, golpes };
}

// ---------------------------------------------------------------- quem sai do campo (N2) e a destruição em massa (N1)
// Qualquer permanente que sai do campo tem destino, deduzido pela zona do dono que cresceu entre as duas vistas (o
// eventos-8 troca a dedução pelo motivo do servidor). O jeito da saída: criatura e planeswalker morrem (racham,
// escurecem e voam); terreno, artefato e encantamento saem secos (sem racha); quem volta para a mão ou o grimório só
// voa (de verso quando a carta some da vista: a mão de um oponente, o grimório); a ficha some no lugar.

/** a zona para onde foi uma carta que saiu do campo */
export type ZonaSaida = 'graveyard' | 'exile' | 'command' | 'hand' | 'library';
export type JeitoSaida = 'morte' | 'seca' | 'volta' | 'some';
export interface Saida { o: ObjView; zona: ZonaSaida | null; jeito: JeitoSaida; verso: boolean }

/** a zona do dono `p` que cresceu de `a` para `v`, na ordem cemitério, exílio, comando, mão, grimório; null se nenhuma */
export function zonaQueCresceu(a: GameView, v: GameView, p: PlayerId): ZonaSaida | null {
  const jog = (x: GameView) => x.players.find((j) => j.id === p);
  const conta: [ZonaSaida, (x: GameView) => number][] = [
    ['graveyard', (x) => jog(x)?.graveyard.length ?? 0],
    ['exile', (x) => x.exile.filter((e) => e.owner === p).length],
    ['command', (x) => x.command.filter((e) => e.owner === p && !e.emblem).length],
    ['hand', (x) => jog(x)?.handCount ?? 0],
    ['library', (x) => jog(x)?.libraryCount ?? 0],
  ];
  for (const [z, n] of conta) if (n(v) > n(a)) return z;
  return null;
}

const morre = (o: ObjView) => o.types.includes('Creature') || o.types.includes('Planeswalker');

/** as permanentes que saíram do campo de `a` para `v`, com destino e jeito (a carta sem destino conhecido fica de fora) */
export function planejarSaidas(a: GameView, v: GameView, eu: PlayerId): Saida[] {
  const agora = new Set(v.battlefield.map((x) => x.id));
  const zonas = new Map<PlayerId, ZonaSaida | null>();
  const zonaDe = (p: PlayerId) => { if (!zonas.has(p)) zonas.set(p, zonaQueCresceu(a, v, p)); return zonas.get(p)!; };
  return a.battlefield.filter((x) => !agora.has(x.id)).flatMap((o): Saida[] => {
    // a ficha deixa de existir fora do campo (CR 111.7): some no lugar
    if (o.token) return [{ o, zona: null, jeito: 'some', verso: false }];
    const zona = zonaDe(o.owner);
    if (!zona) return [];
    if (zona === 'hand' || zona === 'library') return [{ o, zona, jeito: 'volta', verso: zona === 'library' || o.owner !== eu }];
    return [{ o, zona, jeito: morre(o) ? 'morte' : 'seca', verso: false }];
  });
}

/** destruição em massa: a partir de quantas criaturas saindo juntas, sem golpe, a saída vira uma cena de grupo */
export const GRUPO_MIN = 4;
/** intervalo entre uma morte e a seguinte (ms): mín(90; 1300 ÷ n) */
export const GRUPO_PASSO = 90, GRUPO_TOTAL = 1300;
/** cópias voando no grupo (o resto apaga no lugar) */
export const GRUPO_COPIAS = 12;

/** a saída de `saidas` (sem as que morreram num golpe, `noGolpe`) vira cena de grupo? */
export function ehGrupo(saidas: readonly Saida[], noGolpe: ReadonlySet<ObjId>): boolean {
  return saidas.filter((s) => !noGolpe.has(s.o.id) && s.o.types.includes('Creature')).length >= GRUPO_MIN;
}

export const passoGrupo = (n: number): number => (n > 1 ? Math.min(GRUPO_PASSO, GRUPO_TOTAL / n) : 0);

/** um item do grupo: onde está, se tem de voar (comandante para o Comando) e se pode voar (a ficha só some) */
export interface ItemGrupo { x: number; y: number; deveVoar: boolean; podeVoar: boolean }

/**
 * A ordem do grupo: pela distância da origem (a onda passa e eles caem), o intervalo de passoGrupo e quem voa (os que
 * têm de voar e, dos outros, os primeiros até GRUPO_COPIAS cópias no total). Devolve, na ordem da entrada, o instante de
 * começo (ms depois de `inicio`) e se a cópia voa.
 */
export function ordenarGrupo(itens: readonly ItemGrupo[], origem: { x: number; y: number }, inicio = 0): { inicio: number; voa: boolean }[] {
  const ordem = itens.map((it, i) => ({ i, d: Math.hypot(it.x - origem.x, it.y - origem.y) })).sort((p, q) => p.d - q.d || p.i - q.i);
  const passo = passoGrupo(itens.length);
  let livres = GRUPO_COPIAS - itens.filter((it) => it.deveVoar).length;
  const r: { inicio: number; voa: boolean }[] = new Array(itens.length);
  ordem.forEach(({ i }, k) => {
    const it = itens[i];
    const voa = it.deveVoar || (it.podeVoar && livres-- > 0);
    r[i] = { inicio: Math.round(inicio + k * passo), voa };
  });
  return r;
}
