// Will of the Abzan
// Choose one. If you control a commander as you cast this spell, you may choose both instead.
// • Any number of target opponents each sacrifice a creature with the greatest power among creatures that player controls
//   and lose 3 life.
// • Return target creature card from your graveyard to the battlefield.
import { chars, controlledBy, controllerOf, defineCard, eachSacrifices, is, isCreature, loseLife, modal, putOntoBattlefield, t, tgt } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Will of the Abzan',
  faces: [{
    spell: {
      // rulings 1-3: qualquer comandante que você controle, verificado ao escolher os modos
      modes: modal(1, (c) => (controlledBy(c.g, c.you, (id) => {
        const o = c.g.state.objects[id];
        return o.card !== null && !!c.g.state.cards[o.card]?.isCommander;
      }).length > 0 ? 2 : 1), [
        {
          text: 'Qualquer número de oponentes alvo sacrifica cada um uma criatura de maior força e perde 3 de vida',
          targets: [{ ...t.opponent('oponentes alvo'), min: 0, max: 99 }],
          *effect(c) {
            const ops = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'player' && !c.g.state.players[r.id].left ? [r.id as PlayerId] : []));
            if (!ops.length) return;
            const maior = (id: number) => {
              if (!isCreature(c.g, id)) return false;
              const p = controllerOf(c.g, id);
              const max = Math.max(...controlledBy(c.g, p, (x) => isCreature(c.g, x)).map((x) => chars(c.g, x).power ?? 0));
              return (chars(c.g, id).power ?? 0) === max;
            };
            yield* eachSacrifices(c, ops, maior, 1, 'uma criatura com a maior força');
            for (const p of ops) loseLife(c.g, p, 3, c.source);
          },
        },
        {
          text: 'Devolva a carta de criatura alvo do seu cemitério ao campo',
          targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect'); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'teste: o comandante de outro jogador também conta',
    2: 'regra geral: CR 700.2 — verificado ao escolher os modos',
    3: 'regra geral: CR 601.2i — ninguém age no meio da conjuração',
  },
});
