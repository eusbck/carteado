// Lorehold Charm
// Choose one —
// • Each opponent sacrifices a nontoken artifact of their choice.
// • Return target artifact or creature card with mana value 2 or less from your graveyard to the battlefield.
// • Creatures you control get +1/+1 and gain trample until end of turn.
import { and, creaturesOf, defineCard, eachSacrifices, is, isType, modal, or, putOntoBattlefield, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Lorehold Charm',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Cada oponente sacrifica um artefato que não seja ficha',
          *effect(c) { yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isType(c.g, id, 'Artifact') && !c.g.state.objects[id].isToken, 1, 'um artefato que não seja ficha'); },
        },
        {
          text: 'Devolva a carta de artefato ou criatura alvo com valor de mana 2 ou menos do seu cemitério ao campo',
          targets: [t.card('graveyard', and(or(is.artifact, is.creature), is.mvAtMost(2)), 'carta de artefato ou criatura alvo com valor de mana 2 ou menos')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect'); },
        },
        {
          text: 'As criaturas que você controla recebem +1/+1 e ganham atropelar até o fim do turno',
          *effect(c) { untilEndOfTurn(c, creaturesOf(c.g, c.you), [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'trample' }]); },
        },
      ]),
    },
  }],
  rulings: { 1: 'regra geral: CR 202.3e — X vale 0 no cemitério' },
});
