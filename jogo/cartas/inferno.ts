// Peças repetidas nas cartas do deck Heavenly Inferno.
import { attachedGets, chars, controllerOf, isType, staticAbility, untilEndOfTurn } from '../motor/api.ts';
import type { AbilityDef, Ctx, SCtx } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { Mod, ObjId, TargetRef } from '../motor/types.ts';

/**
 * Os Votos (Vow of Malice, Duty, Lightning): "A criatura encantada recebe +2/+2, tem [palavra-chave] e não pode atacar
 * você nem planeswalkers que você controla." "Você" é quem controla a Aura.
 */
export function voto(kw: string, texto: string): AbilityDef[] {
  return [
    attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw }], texto),
    staticAbility({
      rules: {
        canAttack: (c: SCtx, atacante: ObjId, alvo: TargetRef) => !(c.g.state.objects[c.source]?.attachedTo === atacante && (
          (alvo.kind === 'player' && alvo.id === c.you) || (alvo.kind === 'obj' && isType(c.g, alvo.id, 'Planeswalker') && controllerOf(c.g, alvo.id) === c.you))),
      },
    }),
  ];
}

/** "se você conjurou esta mágica durante a sua fase principal": a etapa não muda com a mágica na pilha, e a cópia não foi conjurada */
export function conjuradaNaSuaFasePrincipal(c: Ctx | SCtx): boolean {
  const s = c.g.state;
  const o = s.objects[c.source];
  const principal = s.turn.active === c.you && (s.turn.step === 'main1' || s.turn.step === 'main2');
  return principal && !o?.isCopy && !o?.stack?.isCopy;
}

/** "se você a conjurou da sua mão": a permanente guarda os dados da mágica que ela foi (objeto.data.spell) */
export function conjuradaDaMao(g: G, id: ObjId): boolean {
  const o = g.state.objects[id] ?? g.state.lki[id]?.obj;
  return (o?.data.spell as { castFrom?: string } | undefined)?.castFrom === 'hand';
}

/** radiância (palavra de habilidade): a criatura alvo e cada outra criatura que compartilha uma cor com ela */
export function radiancia(g: G, alvo: ObjId): ObjId[] {
  const cores = chars(g, alvo).colors;
  const s = g.state;
  return [alvo, ...s.zones.battlefield.filter((id) => id !== alvo && !s.objects[id].phasedOut && chars(g, id).types.includes('Creature') && chars(g, id).colors.some((cor) => cores.includes(cor)))];
}

/** "[esta criatura] recebe +P/+T até o fim do turno", se ela ainda estiver no campo */
export function bombeia(c: Ctx, p: number, t: number): void {
  if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p, t } as Mod]);
}
