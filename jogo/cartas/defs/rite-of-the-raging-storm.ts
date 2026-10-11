// Rite of the Raging Storm
// Creatures named Lightning Rager can't attack you or planeswalkers you control.
// At the beginning of each player's upkeep, that player creates a 5/1 red Elemental creature token named Lightning
// Rager. It has trample, haste, and "At the beginning of the end step, sacrifice this token."
import { chars, controllerOf, createTokens, defineCard, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Rite of the Raging Storm',
  faces: [{
    abilities: [
      // ruling 1: só vale enquanto o encantamento está no campo, na hora de declarar os atacantes
      staticAbility({
        rules: {
          canAttack: (c, atacante, alvo) => {
            if (chars(c.g, atacante).name !== 'Lightning Rager') return true;
            const defensor = alvo.kind === 'player' ? alvo.id : controllerOf(c.g, alvo.id);
            return defensor !== c.you;
          },
        },
        text: 'As criaturas com o nome Lightning Rager não podem atacar você nem planeswalkers que você controla.',
      }),
      // ruling 2: a ficha tem o nome Lightning Rager (cartas/fichas.ts); quem a cria é o jogador da manutenção
      triggered(on.upkeep('each'), function* (c) {
        const p = c.g.state.turn.active;
        if (!c.g.state.players[p].left) yield* createTokens(c.g, p, 'Lightning Rager', 1);
      }, { text: 'No início da manutenção de cada jogador, esse jogador cria uma ficha de criatura Elemental 5/1 vermelha com o nome Lightning Rager. Ela tem atropelar, ímpeto e "No início da etapa final, sacrifique esta ficha."' }),
    ],
  }],
  rulings: {
    1: 'teste: Lightning Rager não pode atacar quem controla o Rite, mas pode atacar os outros',
    2: 'teste: cada jogador cria na própria manutenção um Lightning Rager 5/1, sacrificado no início da etapa final',
  },
});
