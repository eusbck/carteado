// O combate visto de uma vista para a seguinte (sem DOM, testável): quem acabou de ser declarado atacante e quem golpeou
// no dano de combate (contra os bloqueadores, o jogador ou o planeswalker), com quanto e se morreu. Efeitos.tsx anima
// a partir daqui (impacto.ts).
//
// O dano de combate só vale quando a etapa passou por uma etapa de dano entre as duas vistas (a mágica que dá dano na
// etapa de bloqueadores não vira golpe) e houve dano ou morte de fato. Primeiro golpe e golpe duplo (CR 510.4): na
// etapa de primeiro golpe só golpeiam os que têm um dos dois; na normal, os sem primeiro golpe e os de golpe duplo; as
// duas etapas juntas numa vista só (a sala mandou as duas de uma vez) golpeiam todos uma vez.

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
