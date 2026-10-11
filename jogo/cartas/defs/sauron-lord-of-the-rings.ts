// Sauron, Lord of the Rings
// When you cast this spell, amass Orcs 5, mill five cards, then return a creature card from your graveyard to the
// battlefield.
// Trample
// Whenever a commander an opponent controls dies, the Ring tempts you.
import { amass, chooseItems, defineCard, isCreature, keyword, mill, nameOf, objItem, on, onCastThis, putOntoBattlefield, ringTempts, triggered } from '../../motor/api.ts';
import { ANEL, REUNIR } from '../mordor.ts';

export default defineCard({
  name: 'Sauron, Lord of the Rings',
  faces: [{
    abilities: [
      // gatilho de conjuração: resolve antes de Sauron, mesmo que ele seja anulado
      onCastThis(function* (c) {
        yield* amass(c.g, c.you, 'Orc', 5);
        yield* mill(c.g, c.you, 5);
        // ruling 1: sem alvo; qualquer carta de criatura do seu cemitério, moída agora ou não
        const cartas = c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id));
        if (!cartas.length) return;
        const [esc] = cartas.length === 1 ? [String(cartas[0])] : yield* chooseItems(c.g, c.you, 'Sauron: escolha a carta de criatura do seu cemitério que volta ao campo', cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        yield* putOntoBattlefield(c.g, [{ id: Number(esc), controller: c.you }], 'effect');
      }, 'Quando você conjura esta mágica, reúna Orcs 5, moa cinco cartas e depois devolva uma carta de criatura do seu cemitério para o campo de batalha.'),
      keyword('trample'),
      // ruling 2: dispara mesmo que o dono leve o comandante para a zona de comando depois de ele morrer (CR 903.9a)
      triggered(on.dies((c, lki, old) => c.g.isOpponent(c.you, lki.controller) && old.card !== null && !!c.g.state.cards[old.card]?.isCommander), function* (c) {
        yield* ringTempts(c.g, c.you);
      }, { text: 'Sempre que um comandante que um oponente controla morre, o Anel tenta você.' }),
    ],
  }],
  rulings: {
    1: 'teste: ao ser conjurado, reúne Orcs 5, moi cinco cartas e devolve uma criatura do seu cemitério, que já podia estar lá',
    2: 'regra geral: CR 903.9a — o comandante morre e só depois o dono pode levá-lo para a zona de comando: o gatilho dispara',
    3: ANEL.emblema,
    4: ANEL.semCriatura,
    5: ANEL.mesmo,
    6: ANEL.ordem,
    7: ANEL.obrigatorio,
    8: ANEL.um,
    9: ANEL.alvos,
    10: REUNIR.escrita,
    11: REUNIR.como,
    12: REUNIR.zumbis,
    13: REUNIR.varios,
    14: REUNIR.entra00,
    15: REUNIR.alvos,
    16: REUNIR.reunido,
  },
});
