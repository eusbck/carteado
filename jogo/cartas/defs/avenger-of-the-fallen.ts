// Avenger of the Fallen
// Deathtouch
// Mobilize X, where X is the number of creature cards in your graveyard. (Whenever this creature attacks, create X
// tapped and attacking 1/1 red Warrior creature tokens. Sacrifice them at the beginning of the next end step.)
import { defineCard, isCreature, keyword, mobilize } from '../../motor/api.ts';

export default defineCard({
  name: 'Avenger of the Fallen',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      // ruling 1: X é calculado uma vez, quando a habilidade resolve (motor/criaturas.ts mobilize com função)
      mobilize((c) => c.g.state.zones.graveyard[c.you].filter((id) => isCreature(c.g, id)).length,
        'Mobilizar X, onde X é o número de cartas de criatura no seu cemitério (sempre que esta criatura ataca, crie X fichas de criatura Guerreiro vermelhas 1/1 viradas e atacando; sacrifique-as no início da próxima etapa final).'),
    ],
  }],
  rulings: {
    1: 'teste: ao atacar, cria uma ficha de Guerreiro atacando para cada carta de criatura no cemitério',
    2: 'regra geral: CR 702.181a — cada ficha ataca quem você escolher (motor/criaturas.ts mobilize)',
    3: 'regra geral: CR 508.3a — fichas que entram atacando não foram declaradas atacantes (motor/criaturas.ts)',
  },
});
