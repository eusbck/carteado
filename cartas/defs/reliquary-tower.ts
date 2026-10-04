// Reliquary Tower
// You have no maximum hand size.
// {T}: Add {C}.
import { defineCard, mana, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Reliquary Tower',
  faces: [{
    abilities: [
      staticAbility({ text: 'Você não tem tamanho máximo de mão.', rules: { noMaxHandSize: (c, p) => p === c.you } }),
      mana('C'),
    ],
  }],
  rulings: { 1: 'não se aplica: nenhuma carta dos decks define o tamanho máximo de mão' },
});
