// Technomancer
// When this creature enters, mill three cards, then return any number of artifact creature cards with total mana value 6
// or less from your graveyard to the battlefield.
import { chooseItems, defineCard, etb, manaValue, mill, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';
import { ehCriaturaArtefato } from '../necrons.ts';

export default defineCard({
  name: 'Technomancer',
  faces: [{
    abilities: [
      etb(function* (c) {
        yield* mill(c.g, c.you, 3);
        // ruling 1: qualquer carta do cemitério, não só as trituradas; ruling 2: X no custo conta como 0 (CR 202.3e)
        const escolhidas: number[] = [];
        let resta = 6;
        for (;;) {
          const cands = c.g.state.zones.graveyard[c.you].filter((id) => !escolhidas.includes(id) && ehCriaturaArtefato(c.g, id) && manaValue(c.g, id) <= resta);
          if (!cands.length) break;
          const esc = yield* chooseItems(c.g, c.you, `Technomancer: devolva cartas de criatura artefato do cemitério (restam ${resta} de valor de mana)`, cands.map((id) => objItem(c.g, id, `${nameOf(c.g, id)} (${manaValue(c.g, id)})`)), 0, 1);
          if (!esc.length) break;
          escolhidas.push(Number(esc[0]));
          resta -= manaValue(c.g, Number(esc[0]));
        }
        if (escolhidas.length) yield* putOntoBattlefield(c.g, escolhidas.map((id) => ({ id, controller: c.you })), 'effect');
      }, { text: 'Quando esta criatura entra, triture três cartas e depois devolva ao campo de batalha qualquer número de cartas de criatura artefato com valor de mana total 6 ou menos do seu cemitério.' }),
    ],
  }],
  rulings: {
    1: 'teste: tritura três e devolve criaturas artefato do cemitério com valor de mana total até 6, inclusive as que já estavam lá',
    2: 'regra geral: CR 202.3e — fora da pilha, o X do custo conta como 0 no valor de mana (motor/chars.ts manaValue)',
  },
});