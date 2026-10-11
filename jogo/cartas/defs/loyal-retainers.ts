// Loyal Retainers
// Sacrifice this creature: Return target legendary creature card from your graveyard to the battlefield. Activate only
// during your turn, before attackers are declared.
import { activated, defineCard, isCreature, isLegendary, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Loyal Retainers',
  faces: [{
    abilities: [
      activated('Sacrifice this creature', function* (c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[id]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        // ruling 1: só antes da etapa de declarar atacantes da primeira fase de combate do turno
        condition: (c) => {
          const tn = c.g.state.turn;
          return tn.active === c.you && (tn.combatCount === 0 || (tn.combatCount === 1 && tn.step === 'beginCombat'));
        },
        targets: [t.card('graveyard', (c, id) => isCreature(c.g, id) && isLegendary(c.g, id), 'carta de criatura lendária alvo do seu cemitério', 'you')],
        text: 'Sacrifique esta criatura: Devolva ao campo a carta de criatura lendária alvo do seu cemitério. Ative somente durante o seu turno, antes de os atacantes serem declarados.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: só no seu turno e antes de os atacantes serem declarados',
  },
});