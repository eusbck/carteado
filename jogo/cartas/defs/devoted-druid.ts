// Devoted Druid
// {T}: Add {G}.
// Put a -1/-1 counter on this creature: Untap this creature.
import { activated, defineCard, mana, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Devoted Druid',
  faces: [{
    abilities: [
      mana('G', { text: '{T}: Adicione {G}.' }),
      activated('Put a -1/-1 counter on this creature', function* (c) { if (c.g.state.objects[c.source]) untap(c.g, c.source); }, { text: 'Coloque um marcador -1/-1 nesta criatura: Desvire esta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: o marcador é custo; com resistência 0 morre antes de desvirar',
    2: 'não se aplica: nenhuma carta dos decks impede ou altera colocar marcadores',
  },
});
