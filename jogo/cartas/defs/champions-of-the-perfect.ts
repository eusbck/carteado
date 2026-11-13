// Champions of the Perfect
// As an additional cost to cast this spell, behold an Elf and exile it. (Exile an Elf you control or an Elf card from
// your hand.)
// Whenever you cast a creature spell, draw a card.
// When this creature leaves the battlefield, return the exiled card to its owner's hand.
import { additionalCost, asEnters, behold, controllerOf, defineCard, draw, exile, is, isSubtype, lkiObj, moveObjects, on, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const ehElfo = (c: SCtx, id: number) => id !== c.source && isSubtype(c.g, id, 'Elf');

export default defineCard({
  name: 'Champions of the Perfect',
  faces: [{
    // CR 701.4a, 601.2h: contemplar um Elfo (seu no campo ou da mão) e exilá-lo é custo adicional obrigatório
    additionalCosts: [additionalCost('contemplar', 'contemplar um Elfo e exilá-lo', [{
      k: 'custom', label: 'contemplar um Elfo e exilá-lo',
      canPay: (c) => c.g.state.zones.hand[c.you].some((id) => ehElfo(c, id))
        || c.g.state.zones.battlefield.some((id) => !c.g.state.objects[id].phasedOut && controllerOf(c.g, id) === c.you && ehElfo(c, id)),
      *pay(c) {
        const visto = yield* behold(c, (id) => ehElfo(c, id), 'um Elfo');
        if (!visto) return false;
        const [novo] = yield* exile(c.g, [visto.id]);
        // a carta exilada fica ligada à mágica (CR 607.2): o permanente a acha pelo id da mágica que ele foi
        if (novo !== null && novo !== undefined && c.g.state.objects[novo]) c.g.state.objects[novo].data.campeoesDe = c.source;
        return { contemplado: novo };
      },
    }])],
    abilities: [
      // guarda o id da mágica que virou este permanente (ev.obj ainda é o objeto da pilha)
      asEnters(function* (_c, ev) { ev.choices.magicaCampeoes = ev.obj; }),
      triggered(on.youCast(is.creature), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você conjura uma mágica de criatura, compre uma carta.' }),
      triggered(on.selfLeaves(), function* (c) {
        const magica = (c.g.state.objects[c.source] ?? lkiObj(c.g, c.source))?.choices.magicaCampeoes as number | undefined;
        if (magica === undefined) return;
        const cartas = c.g.state.zones.exile.filter((id) => c.g.state.objects[id].data.campeoesDe === magica);
        if (cartas.length) yield* moveObjects(c.g, cartas.map((id) => ({ id, to: 'hand' as const })), 'effect');
      }, { text: 'Quando esta criatura sai do campo, devolva a carta exilada à mão do dono.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 205.3 — "carta de Elfo" é a que tem o subtipo Elf (inclusive com polimorfo)',
    2: 'regra geral: CR 701.4a — a carta revelada fica revelada enquanto a mágica está na pilha (motor/conjurar-alternativo.ts behold)',
    3: 'teste: anulada a mágica, a carta exilada fica no exílio',
    4: 'não se aplica: o jogo não guarda cartas reveladas na mão',
  },
});
