// Szarekh, the Silent King
// Flying
// My Will Be Done — Whenever Szarekh attacks, mill three cards. You may put an artifact creature card or Vehicle card
// from among the cards milled this way into your hand.
import { chooseItems, defineCard, keyword, mill, moveObjects, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import { ehCriaturaArtefatoOuVeiculo } from '../necrons.ts';

export default defineCard({
  name: 'Szarekh, the Silent King',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        const cartas = (yield* mill(c.g, c.you, 3)).filter((id) => c.g.state.objects[id]?.zone === 'graveyard' && ehCriaturaArtefatoOuVeiculo(c.g, id));
        if (!cartas.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Szarekh: você pode pôr na mão uma carta de criatura artefato ou de Veículo entre as trituradas', cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* moveObjects(c.g, [{ id: Number(esc[0]), to: 'hand' }], 'effect');
      }, { text: 'My Will Be Done — Sempre que Szarekh ataca, triture três cartas. Você pode colocar na sua mão uma carta de criatura artefato ou de Veículo entre as cartas trituradas assim.' }),
    ],
  }],
  rulings: {},
});