// Peças repetidas nas cartas do deck [cEDH] - Twitch Control (Orvar, the All-Form): anular dando um Bird, virar ou
// desvirar artefato, criatura ou terreno, "compre uma carta no início da manutenção do próximo turno" e troca de texto.
import {
  addEffect, chooseOne, COLOR_NAMES, counter, createTokens, defineAbility, draw, is, mayPay, nameOf, nextUpkeepTrigger, or, t, tap,
  untap, yesNo, type Gen,
} from '../motor/api.ts';
import type { Ctx, TargetSpec } from '../motor/defs.ts';
import { canAfford } from '../motor/costs.ts';
import { parseCost } from '../motor/mana.ts';
import type { Color, Duration, Mod, ObjId, PlayerId } from '../motor/types.ts';
import { obj, reg } from '../motor/registro.ts';

/** "artefato, criatura ou terreno alvo" (Twitch, Jolt, Infuse, Mind Games) */
export function alvoArtefatoCriaturaOuTerreno(): TargetSpec {
  return t.permanent(or(is.artifact, is.creature, is.land), 'artefato, criatura ou terreno alvo');
}

/**
 * "Anule a mágica alvo. Quem a controla cria uma ficha Bird 2/2 azul com voar" (Swan Song, Strix Serenade). O Bird vem
 * mesmo se a mágica não puder ser anulada (ruling das duas cartas): é quem a controlava ao resolver.
 */
export function* anulaComPassaro(c: Ctx, id: ObjId): Gen<void> {
  const quem = c.g.state.objects[id]?.stack?.controller;
  yield* counter(c.g, id);
  if (quem !== undefined && !c.g.state.players[quem].left) yield* createTokens(c.g, quem, 'Bird 2/2 azul', 1);
}

/**
 * "Anule a mágica alvo. Se ela for anulada assim, exile-a em vez de pô-la no cemitério do dono" (Force of Negation):
 * a substituição só vale se a anulação acontecer (CR 701.6a, 614.1a)
 */
export function* anulaEExila(c: Ctx, id: ObjId): Gen<boolean> {
  const o = c.g.state.objects[id];
  if (!o?.stack) return false;
  const antes = o.stack.data.exileInsteadOfGraveyard;
  o.stack.data.exileInsteadOfGraveyard = true;
  const anulou = yield* counter(c.g, id);
  if (!anulou && c.g.state.objects[id]?.stack) {
    if (antes === undefined) delete c.g.state.objects[id].stack!.data.exileInsteadOfGraveyard;
    else c.g.state.objects[id].stack!.data.exileInsteadOfGraveyard = antes;
  }
  return anulou;
}

/** "Você pode virar ou desvirar [o permanente]" (Twitch, Jolt): pergunta e faz */
export function* viraOuDesvira(c: Ctx, id: ObjId, fonte: string): Gen<void> {
  const o = c.g.state.objects[id];
  if (!o || o.zone !== 'battlefield') return;
  const virar = !o.tapped;
  const acao = virar ? 'Virar' : 'Desvirar';
  if (!(yield* yesNo(c.g, c.you, `${fonte}: ${acao.toLowerCase()} ${nameOf(c.g, id)}?`, acao, 'Não fazer nada'))) return;
  if (virar) tap(c.g, id); else untap(c.g, id);
}

/** gatilho atrasado "compre uma carta no início da manutenção do próximo turno" (CR 603.7), um por carta */
export function compraNaProximaManutencao(nome: string) {
  return defineAbility(`${nome}:compraNaManutencao`, nextUpkeepTrigger(function* (c) {
    yield* draw(c.g, c.you, 1);
  }, 'No início da manutenção do próximo turno, compre uma carta.'));
}

/**
 * "você pode comprar uma carta a menos que esse jogador pague {N}" (Rhystic Study, Mystic Remora; CR 118.12a): o
 * jogador decide se paga; se não pagar, você decide se compra (ruling 2 de Rhystic Study)
 */
export function* compraAMenosQuePague(c: Ctx, quem: PlayerId, custo: string, fonte: string): Gen<void> {
  const nome = c.g.state.players[c.you].name;
  if (!c.g.state.players[quem].left && podePagar(c, quem, custo) && (yield* mayPay(c, quem, custo, `que ${nome} não possa comprar uma carta (${fonte})`))) return;
  if (yield* yesNo(c.g, c.you, `${fonte}: comprar uma carta?`, 'Comprar', 'Não comprar')) yield* draw(c.g, c.you, 1);
}

const TIPOS_BASICOS = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];
const NOME_TIPO: Record<string, string> = { Plains: 'Plains (planície)', Island: 'Island (ilha)', Swamp: 'Swamp (pântano)', Mountain: 'Mountain (montanha)', Forest: 'Forest (floresta)' };

/**
 * Efeito de troca de texto (CR 612): na resolução, quem controla a mágica escolhe a palavra trocada e a nova (rulings
 * "você escolhe as palavras na resolução" e "não pode trocar por ela mesma"). `tipos`: o que a carta permite trocar.
 * A troca vale para o texto e a linha de tipo (motor/chars.ts aplicaTrocaDeTexto). Se o alvo é uma mágica de permanente,
 * a troca continua no permanente em que ela vira (ruling de Glamerdye e Crystal Spray).
 */
export function* trocaTexto(c: Ctx, alvo: ObjId, tipos: ('color' | 'landType')[], duracao: Duration, fonte: string): Gen<void> {
  const o = c.g.state.objects[alvo];
  if (!o) return;
  let tipo = tipos[0];
  if (tipos.length > 1) {
    tipo = (yield* chooseOne(c.g, c.you, `${fonte}: trocar uma palavra de cor ou um tipo básico de terreno?`, [
      { id: 'color', label: 'Palavra de cor' }, { id: 'landType', label: 'Tipo básico de terreno' },
    ])) as 'color' | 'landType';
  }
  const opcoes = tipo === 'color' ? (['W', 'U', 'B', 'R', 'G'] as Color[]).map((x) => ({ id: x, label: COLOR_NAMES[x] })) : TIPOS_BASICOS.map((x) => ({ id: x, label: NOME_TIPO[x] }));
  const de = yield* chooseOne(c.g, c.you, `${fonte}: escolha a palavra que vai ser trocada`, opcoes);
  const para = yield* chooseOne(c.g, c.you, `${fonte}: escolha a palavra nova`, opcoes.filter((x) => x.id !== de));
  const mod: Mod = { k: 'textChange', kind: tipo, from: de, to: para };
  addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: duracao, affected: [alvo], mods: [mod] });
  const st = c.g.state.objects[alvo]?.zone === 'stack' ? c.g.state.objects[alvo].stack : undefined;
  if (st && st.kind === 'spell') {
    const lista = (st.data.carryToPermanent as unknown[] | undefined) ?? [];
    st.data.carryToPermanent = [...lista, { mods: [mod], duration: duracao, controller: c.you, source: c.source }];
  }
  const rot = (x: string) => opcoes.find((y) => y.id === x)?.label ?? x;
  reg(c.g, 'outro', { rule: '612.2', actor: c.you })`${fonte}: no texto de ${obj(alvo)}, "${rot(de)}" passa a ser "${rot(para)}".`;
}

/** o jogador tem como pagar este custo de mana agora? (sem isso, nem pergunta) */
export function podePagar(c: Ctx, quem: PlayerId, custo: string): boolean {
  return canAfford(c.g, quem, parseCost(custo), { purpose: { kind: 'effect' } });
}

/** quem controla a mágica na pilha */
export function controladorDaMagica(c: { g: Ctx['g'] }, id: ObjId): PlayerId | undefined {
  return c.g.state.objects[id]?.stack?.controller;
}
