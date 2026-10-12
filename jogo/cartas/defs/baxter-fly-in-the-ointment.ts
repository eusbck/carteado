// Baxter, Fly in the Ointment
// Whenever Baxter enters or attacks, each creature you control with a counter on it gains flying until end of turn.
// Whenever you draw a card, put a +1/+1 counter on Baxter.
import { addCounters, creaturesOf, defineCard, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { temMarcador } from '../tartarugas.ts';

export default defineCard({
  name: 'Baxter, Fly in the Ointment',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        const ids = creaturesOf(c.g, c.you).filter((id) => temMarcador(c.g, id));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'flying' }]);
      }, { text: 'Sempre que Baxter entra ou ataca, cada criatura que você controla com um marcador ganha voar até o fim do turno.' }),
      triggered(on.custom((e, c) => e.type === 'draw' && e.player === c.you), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você compra uma carta, coloque um marcador +1/+1 em Baxter.' }),
    ],
  }],
  rulings: {},
});