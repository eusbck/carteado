// Peças repetidas nas cartas do deck Blame Game (Murders at Karlov Manor Commander): suspeitar (CR 701.60), encobrir
// (CR 701.58), "goadada e/ou suspeita" e as notas de rulings de goad, que se repetem em várias cartas.
import { addEffect, chars, defineAbility, goad, hooks, keyword, nameOf, putOntoBattlefield, wardGranted } from '../motor/api.ts';
import type { Gen, StaticDef } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { AbilityInst, ObjId, PlayerId } from '../motor/types.ts';

/** "Esta criatura não pode bloquear", que a criatura suspeita tem enquanto estiver suspeita (CR 701.60c) */
const SUSPEITA_NAO_BLOQUEIA = defineAbility<StaticDef>('precons-a:suspeita:naoBloqueia', {
  ...keyword('cantBlock'), text: 'Suspeita: esta criatura tem ameaçar e não pode bloquear.',
});

/** a permanente está suspeita? (designação, CR 701.60b; acaba quando ela sai do campo, 701.60a) */
export function suspeita(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  return !!o && o.zone === 'battlefield' && !!o.data.suspeita;
}

/**
 * CR 701.60: suspeitar uma criatura. Ela fica suspeita até sair do campo (701.60a); a designação não é habilidade nem
 * valor copiável (701.60b, ruling 4: o objeto guarda `data.suspeita`) e, enquanto ela estiver suspeita, a permanente tem
 * ameaçar e "esta criatura não pode bloquear" (701.60c). As duas vêm de um efeito com o registro de data e hora da
 * suspeita: se ela perder todas as habilidades depois, perde as duas, mas continua suspeita (ruling 3). Suspeitar de novo
 * não faz nada (701.60d). Devolve true se ela passou a ser suspeita agora.
 */
export function suspeitar(g: G, id: ObjId, por: PlayerId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield' || o.phasedOut || o.data.suspeita) return false;
  if (!chars(g, id).types.includes('Creature')) return false;
  o.data.suspeita = true;
  addEffect(g, {
    source: id, sourceDef: '', controller: por, duration: { kind: 'whileOnBattlefield', obj: id }, affected: [id],
    mods: [{ k: 'addKeyword', kw: 'menace' }, { k: 'addAbility', id: SUSPEITA_NAO_BLOQUEIA.id! }],
  });
  g.log(`${nameOf(g, id)} fica suspeita (tem ameaçar e não pode bloquear).`, { rule: '701.60' });
  return true;
}

/** criaturas suspeitas no campo */
export function suspeitas(g: G): ObjId[] {
  return g.state.zones.battlefield.filter((id) => suspeita(g, id));
}

/** a criatura está goadada (por um efeito com duração ou por uma permanente, CR 701.15)? */
export function goadada(g: G, id: ObjId): boolean {
  const o = g.state.objects[id];
  if (!o || o.zone !== 'battlefield') return false;
  return o.goadedBy.length > 0 || hooks(g, 'goads').some((h) => h.fn(h.ctx, id));
}

/** goada várias criaturas por um jogador (cada uma só uma vez por jogador, CR 701.15d) */
export function goadaTodas(g: G, ids: ObjId[], por: PlayerId): void {
  for (const id of ids) goad(g, id, por);
}

// resguardo {2} da carta encoberta (CR 701.58a): a palavra-chave e o gatilho, num id fixo
const RESGUARDO_2 = wardGranted('{2}');

/**
 * CR 701.58a: encobrir — a carta entra no campo virada para baixo como criatura 2/2 com resguardo {2}, sem nome, subtipos
 * nem custo de mana. Vira para cima como a manifestada (701.58b: mostrar que é carta de criatura e pagar o custo de mana;
 * motor/mecanicas.ts turnFaceUp); o resguardo vem só da face para baixo (motor/chars.ts `faceDownAbilities`) e some ao
 * virar. Sem carta (grimório vazio), nada acontece. Devolve a permanente encoberta.
 */
export function* encobrir(g: G, p: PlayerId, carta?: ObjId): Gen<ObjId | null> {
  const id = carta ?? g.state.zones.library[p][0];
  if (id === undefined || g.state.players[p].left) return null;
  const extras: AbilityInst[] = [{ id: RESGUARDO_2, kw: 'ward', param: '{2}' }];
  const [nova] = yield* putOntoBattlefield(g, [{ id, controller: p, faceDown: true, data: { manifestada: true, encoberta: true, faceDownAbilities: extras } }], 'cloak');
  if (nova !== undefined) g.log(`${g.state.players[p].name} encobre uma carta (2/2 virada para baixo com resguardo {2}).`, { rule: '701.58a' });
  return nova ?? null;
}

/** notas dos rulings de goad, que se repetem nas cartas do deck */
export const GOAD = {
  excecoes: 'regra geral: CR 508.1d — virada, impedida de atacar, com enjoo ou com custo para atacar, a criatura goadada não é obrigada a atacar (motor/combat.ts requirements)',
  outroJogador: 'regra geral: CR 701.15b — ataca um jogador que não a goadou se puder; se não puder, pode atacar quem a goadou (motor/combat.ts)',
  naoEHabilidade: 'regra geral: CR 701.15b — goadada é designação, não habilidade: continua mesmo sem habilidades (GameObject.goadedBy)',
  continua: 'regra geral: CR 701.15a — atacar não desfaz o goad; num combate adicional ela precisa atacar de novo (motor/combat.ts)',
  varios: 'regra geral: CR 701.15c — goadada por vários oponentes, cumpre o máximo de exigências atacando quem não a goadou (motor/combat.ts maxObeyed)',
};

/** notas dos rulings de suspeitar, repetidas nas cartas que suspeitam */
export const SUSPEITAR = {
  designacao: 'teste: CR 701.60: suspeita tem ameaçar e não pode bloquear até sair do campo',
  semHabilidades: 'teste: CR 701.60c: perdendo todas as habilidades depois, perde ameaçar e "não pode bloquear", mas continua suspeita',
  copia: 'regra geral: CR 701.60b — suspeita não é valor copiável (fica em GameObject.data, não nos valores copiáveis)',
  deNovo: 'teste: CR 701.60d: suspeitar de novo não faz nada',
  varias: 'regra geral: CR 701.60a — não há limite de criaturas suspeitas ao mesmo tempo (cartas/culpa.ts suspeitar)',
};
