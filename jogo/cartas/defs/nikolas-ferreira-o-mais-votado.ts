// Nikolas Ferreira, o Mais Votado (carta própria da mesa)
// Haste
// Whenever Nikolas Ferreira attacks, create a 1/1 green and white Human Citizen creature token with haste named
// Patriota that's tapped and attacking.
import { defineCard, keyword, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { escolheAtacado } from '../viloes.ts';

export default defineCard({
  name: 'Nikolas Ferreira, o Mais Votado',
  faces: [{
    abilities: [
      keyword('haste'),
      triggered(on.selfAttacks(), function* (c) {
        // CR 508.4: a ficha entra atacando quem você escolher e não foi "declarada como atacante"
        const alvo = yield* escolheAtacado(c, 'Nikolas Ferreira');
        yield* putOntoBattlefield(c.g, [{ controller: c.you, token: { def: 'Patriota' }, tapped: true, attacking: alvo ?? undefined }], 'token');
      }, { text: 'Sempre que Nikolas Ferreira ataca, crie uma ficha Patriota 1/1 verde e branca com ímpeto, virada e atacando.' }),
    ],
  }],
  rulings: {},
});
