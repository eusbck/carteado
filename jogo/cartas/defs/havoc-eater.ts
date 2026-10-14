// Havoc Eater
// Flying
// When this creature enters, for each opponent, goad up to one target creature that opponent controls. Put X +1/+1
// counters on this creature, where X is the total power of creatures goaded this way.
import { addCounters, defineCard, etb, goad, keywords, power, tgtsAll } from '../../motor/api.ts';
import { umaPorOponente } from '../viloes.ts';

export default defineCard({
  name: 'Havoc Eater',
  faces: [{
    abilities: [
      ...keywords('flying'),
      etb(function* (c) {
        const ids = tgtsAll(c, 0).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
        for (const id of ids) goad(c.g, id, c.you);
        // X: a força total delas na resolução, depois de goadadas
        const x = ids.reduce((s, id) => s + Math.max(0, power(c.g, id)), 0);
        if (x > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', x, c.you);
      }, {
        targets: [umaPorOponente('para cada oponente, até uma criatura alvo que esse jogador controla')],
        text: 'Quando esta criatura entra, para cada oponente, goade até uma criatura alvo que esse jogador controla. Coloque X marcadores +1/+1 nesta criatura, em que X é a força total das criaturas goadadas assim.',
      }),
    ],
  }],
  rulings: {},
});
