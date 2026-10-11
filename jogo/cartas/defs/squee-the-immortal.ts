// Squee, the Immortal
// You may cast this card from your graveyard or from exile.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Squee, the Immortal',
  faces: [{
    abilities: [
      // CR 113.6e: a habilidade funciona nas zonas de onde a carta pode ser conjurada
      staticAbility({
        zones: ['graveyard', 'exile'],
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const o = c.g.state.objects[carta];
            if (carta !== c.source || !o || o.owner !== p || (o.zone !== 'graveyard' && o.zone !== 'exile')) return null;
            // ruling 2: paga o custo e segue o tempo normal de uma criatura
            return { key: `squee:${c.source}`, label: o.zone === 'graveyard' ? 'conjurar do cemitério' : 'conjurar do exílio' };
          },
        },
        text: 'Você pode conjurar esta carta do seu cemitério ou do exílio.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: da mão é conjurado normalmente',
    2: 'teste: do cemitério e do exílio, pagando o custo e só no tempo de uma criatura',
  },
});
