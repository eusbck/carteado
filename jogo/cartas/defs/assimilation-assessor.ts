// Assimilation Assessor
// When this creature enters, exile target opponent's graveyard.
// Whenever this creature attacks, assimilate a creature card exiled with it. (Put it onto the battlefield under your
// control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types.)
import { assimilateCard, chars, chooseItems, defineCard, etb, exile, linkedExiled, nameOf, objItem, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

const CHAVE = 'assimilationAssessor';

export default defineCard({
  name: 'Assimilation Assessor',
  faces: [{
    abilities: [
      // as cartas ficam ligadas a esta criatura (CR 607.2a); se ela já saiu, o exílio acontece sem ligação
      etb(function* (c) {
        const op = tgtPlayer(c);
        if (op === null) return;
        const cartas = [...c.g.state.zones.graveyard[op]];
        if (cartas.length) yield* exile(c.g, cartas, { linkTo: { obj: c.source, key: CHAVE } });
      }, { targets: [t.opponent()], text: 'Quando esta criatura entra, exile o cemitério do oponente alvo.' }),
      triggered(on.selfAttacks(), function* (c) {
        const cands = linkedExiled(c.g, c.source, CHAVE).filter((id) => chars(c.g, id).types.includes('Creature'));
        if (!cands.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Assimilation Assessor: escolha a carta de criatura exilada que você vai assimilar', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        yield* assimilateCard(c.g, c.you, Number(esc), c.source, 'Assimilation Assessor');
      }, { text: 'Sempre que esta criatura ataca, assimile uma carta de criatura exilada com ela.' }),
    ],
  }],
  rulings: {},
});
