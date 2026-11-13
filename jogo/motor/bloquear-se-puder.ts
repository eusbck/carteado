// lote4-c: "[criatura] bloqueia [atacante] neste combate se puder" (exigência de bloqueio, CR 509.1c): Tolsimir,
// Midnight's Light. A exigência é um efeito de regra que dura até o fim do combate; ao declarar os bloqueadores, a
// declaração precisa cumprir o máximo de exigências possível sem violar restrições. Exigências que só seriam
// cumpridas pagando um custo para bloquear não contam (CR 509.1c). A validação, junto com "precisa ser bloqueada se
// possível", está em motor/exigencias-bloqueio.ts.
import { addEffect } from './state.ts';
import { controllerOf, hasKw, hooks } from './chars.ts';
import type { G } from './game-context.ts';
import type { ObjId, PlayerId } from './types.ts';
import { obj, reg } from './registro.ts';

export const BLOQUEIA_SE_PUDER = 'rule:blocksIfAble';

/** cria a exigência "`bloqueador` bloqueia `atacante` neste combate se puder" (até o fim do combate) */
export function exigeBloqueio(c: { g: G; you: PlayerId; source: ObjId }, bloqueador: ObjId, atacante: ObjId): void {
  addEffect(c.g, {
    source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'endOfCombat' }, affected: [bloqueador],
    mods: [{ k: 'rule', id: BLOQUEIA_SE_PUDER, params: { atacante } }],
  });
  reg(c.g, 'outro', { rule: '509.1c' })`${obj(bloqueador)} bloqueia ${obj(atacante)} neste combate se puder.`;
}

/** pares [bloqueador, atacante] exigidos para os bloqueadores do defensor, ainda válidos (os dois no campo, o atacante no combate) */
export function bloqueiosExigidos(g: G, defensor: PlayerId): [ObjId, ObjId][] {
  const s = g.state;
  const atacando = new Set((s.combat?.attackers ?? []).filter((a) => !a.removed).map((a) => a.id));
  const out: [ObjId, ObjId][] = [];
  for (const e of s.effects) for (const m of e.mods) {
    if (m.k !== 'rule' || m.id !== BLOQUEIA_SE_PUDER) continue;
    const atacante = Number(m.params?.atacante);
    for (const b of e.affected ?? []) {
      if (s.objects[b]?.zone !== 'battlefield' || controllerOf(g, b) !== defensor || !atacando.has(atacante)) continue;
      if (!out.some(([x, y]) => x === b && y === atacante)) out.push([b, atacante]);
    }
  }
  return out;
}

/**
 * Exigências que a declaração deixa de cumprir podendo cumpri-las (CR 509.1c): o bloqueador pode bloquear o atacante
 * (`candidatos`), sem custo para bloquear, e o atacante não tem ameaçar nem um mínimo de bloqueadores (com essas
 * restrições, cumprir a exigência dependeria de outra criatura bloquear também, o que não é exigido). Um bloqueador
 * com várias exigências cumpre uma delas.
 */
export function exigenciasCumpriveis(g: G, defensor: PlayerId, candidatos: { obj: ObjId; canBlock: ObjId[] }[]): [ObjId, ObjId][] {
  return bloqueiosExigidos(g, defensor).filter(([b, a]) => {
    if (!candidatos.find((c) => c.obj === b)?.canBlock.includes(a)) return false;
    if (hasKw(g, a, 'menace') || hooks(g, 'minBlockers').some((h) => h.fn(h.ctx, a) > 1)) return false;
    return !hooks(g, 'blockCost').some((h) => h.fn(h.ctx, b, a) > 0);
  });
}
