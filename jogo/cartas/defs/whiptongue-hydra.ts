// Whiptongue Hydra
// Reach
// When this creature enters, destroy all creatures with flying. Put a +1/+1 counter on this creature for each creature
// destroyed this way.
import { addCounters, allCreatures, defineCard, destroy, etb, hasKw, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Whiptongue Hydra',
  faces: [{
    abilities: [
      keyword('reach'),
      etb(function* (c) {
        const voadoras = allCreatures(c.g).filter((id) => hasKw(c.g, id, 'flying'));
        // indestrutível e regenerada não contam como destruídas (ruling 1): destroy só devolve as que saíram do campo
        const destruidas = (yield* destroy(c.g, voadoras)).filter((x) => x !== null).length;
        if (destruidas > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', destruidas, c.you);
      }, { text: 'Quando esta criatura entra, destrua todas as criaturas com voar. Coloque um marcador +1/+1 nesta criatura para cada criatura destruída assim.' }),
    ],
  }],
  rulings: {
    1: 'teste: destrói as criaturas com voar e conta só as destruídas (indestrutível não conta)',
    2: 'não se aplica: nenhuma carta com proteção de totem (umbra armor) nos decks',
  },
});
