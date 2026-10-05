// Sun Titan
// Vigilance
// Whenever this creature enters or attacks, you may return target permanent card with mana value 3 or less from your
// graveyard to the battlefield.
import { and, defineCard, is, keyword, nameOf, on, putOntoBattlefield, t, tgt, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Sun Titan',
  faces: [{
    abilities: [
      keyword('vigilance'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (yield* yesNo(c.g, c.you, `Sun Titan: devolver ${nameOf(c.g, id)} ao campo?`)) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        // rulings 1-4: valor de mana impresso; terrenos têm 0; X vale 0
        targets: [t.card('graveyard', and(is.permanentCard, is.mvAtMost(3)), 'carta de permanente alvo com valor de mana 3 ou menos no seu cemitério')],
        text: 'Sempre que esta criatura entra ou ataca, você pode devolver a carta de permanente alvo com valor de mana 3 ou menos do seu cemitério ao campo.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3 — valor de mana pelo custo impresso',
    2: 'regra geral: CR 110.4 — tipos de permanente',
    3: 'teste: terreno tem valor de mana 0 e pode voltar',
    4: 'regra geral: CR 202.3e — X vale 0 no cemitério',
  },
});
