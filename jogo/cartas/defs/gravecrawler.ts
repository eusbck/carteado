// Gravecrawler
// This creature can't block.
// You may cast this card from your graveyard as long as you control a Zombie.
import { controlledBy, defineCard, isSubtype, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Gravecrawler',
  faces: [{
    abilities: [
      { ...keyword('cantBlock'), text: 'Esta criatura não pode bloquear.' },
      // CR 113.6e: funciona no cemitério, de onde a carta pode ser conjurada
      staticAbility({
        zones: ['graveyard'],
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const o = c.g.state.objects[carta];
            if (carta !== c.source || p !== c.you || !o || o.zone !== 'graveyard' || o.owner !== p) return null;
            if (controlledBy(c.g, p, (id) => isSubtype(c.g, id, 'Zombie')).length === 0) return null;
            // ruling 1: só a zona muda; o momento continua o de uma criatura (CR 302.1)
            return { key: `gravecrawler:${c.source}`, label: 'conjurar do cemitério' };
          },
        },
        text: 'Você pode conjurar esta carta do seu cemitério enquanto controlar um Zombie.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: do cemitério, só no tempo de uma criatura (não com a pilha ocupada nem no turno do oponente)',
    2: 'teste: depois de conjurada, perder o Zombie não importa',
  },
});
