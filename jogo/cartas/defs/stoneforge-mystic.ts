// Stoneforge Mystic
// When this creature enters, you may search your library for an Equipment card, reveal it, put it into your hand, then
// shuffle.
// {1}{W}, {T}: You may put an Equipment card from your hand onto the battlefield.
import { activated, chooseItems, defineCard, etb, isSubtype, nameOf, objItem, putOntoBattlefield, searchTo, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Stoneforge Mystic',
  faces: [{
    abilities: [
      etb(function* (c) {
        if (!(yield* yesNo(c.g, c.you, 'Stoneforge Mystic: procurar uma carta de Equipamento no seu grimório?'))) return;
        yield* searchTo(c, c.you, (id) => isSubtype(c.g, id, 'Equipment'), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Equipamento' });
      }, { text: 'Quando esta criatura entra, você pode procurar no seu grimório uma carta de Equipamento, revelá-la, colocá-la na sua mão e depois embaralhar.' }),
      // ruling 1: qualquer Equipamento da mão; entra desanexado
      activated('{1}{W}, {T}', function* (c) {
        const cartas = c.g.state.zones.hand[c.you].filter((id) => isSubtype(c.g, id, 'Equipment'));
        if (!cartas.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Stoneforge Mystic: você pode pôr no campo uma carta de Equipamento da mão', cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you }], 'put');
      }, { text: '{1}{W}, {T}: Você pode colocar no campo de batalha uma carta de Equipamento da sua mão.' }),
    ],
  }],
  rulings: { 1: 'teste: {1}{W}, {T}: põe no campo um Equipamento da mão, desanexado' },
});