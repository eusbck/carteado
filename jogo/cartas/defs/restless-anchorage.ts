// Restless Anchorage
// This land enters tapped.
// {T}: Add {W} or {U}.
// {1}{W}{U}: Until end of turn, this land becomes a 2/3 white and blue Bird creature with flying. It's still a land.
// Whenever this land attacks, create a Map token.
import { activated, createTokens, defineCard, land, mana, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Restless Anchorage',
  faces: [{
    abilities: [
      land.tapped(),
      mana(['W', 'U']),
      // ruling 1: como criatura, o enjoo de invocação vale normalmente (CR 302.6)
      activated('{1}{W}{U}', function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        // continua terreno: só acrescenta o tipo criatura e o subtipo Bird (CR 613.1d, camada 4)
        untilEndOfTurn(c, [c.source], [
          { k: 'addTypes', types: ['Creature'], subtypes: ['Bird'] }, { k: 'setPT', p: 2, t: 3 }, { k: 'setColors', colors: ['W', 'U'] },
          { k: 'addKeyword', kw: 'flying' },
        ]);
      }, { text: '{1}{W}{U}: Até o fim do turno, este terreno vira uma criatura Bird branca e azul 2/3 com voar. Continua sendo terreno.' }),
      // ruling 2: o gatilho é do terreno, vale mesmo se ele virou criatura por outro efeito
      // ruling 3: Map é a ficha predefinida (CR 111.10s, cartas/fichas.ts)
      triggered(on.selfAttacks(), function* (c) { yield* createTokens(c.g, c.you, 'Map', 1); }, { text: 'Sempre que este terreno ataca, crie uma ficha de Mapa.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 302.6: sem controle contínuo desde o início do turno, não ataca nem usa a mana',
    2: 'teste: dispara mesmo se virou criatura por outro efeito',
    3: 'teste: CR 111.10s: a ficha de Mapa faz a criatura alvo explorar',
  },
});
