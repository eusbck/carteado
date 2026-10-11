// Jinnie Fay, Jetmir's Second // Jinnie Fay, Jetmir's Second (carta reversível: as duas faces são iguais e vale a da frente)
// Jinnie Fay, Jetmir's Second {R/G}{G}{G/W} — Legendary Creature — Elf Druid 3/3
// If you would create one or more tokens, you may instead create that many 2/2 green Cat creature tokens with haste or
// that many 3/1 green Dog creature tokens with vigilance.
import { chooseItems, defineCard, staticAbility } from '../../motor/api.ts';

const GATO = 'Cat verde 2/2 ímpeto';
const CAO = 'Dog verde 3/1 vigilância';

export default defineCard({
  name: "Jinnie Fay, Jetmir's Second // Jinnie Fay, Jetmir's Second",
  faces: [{
    abilities: [
      // CR 614.1a: substituição opcional na criação de fichas; a mesma quantidade, todas de um dos dois tipos
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you ? null : {
            label: 'Jinnie Fay: fichas de Cat ou de Dog no lugar',
            *replace(e) {
              const n = e.tokens.length;
              const [esc] = yield* chooseItems(c.g, c.you, `Jinnie Fay: criar ${n} ficha(s) de Cat 2/2 com ímpeto ou de Dog 3/1 com vigilância no lugar?`, [
                { id: 'nao', label: 'Criar as fichas originais' },
                { id: 'gato', label: 'Cat 2/2 verde com ímpeto' },
                { id: 'cao', label: 'Dog 3/1 verde com vigilância' },
              ], 1, 1);
              if (esc === 'nao') return e;
              // ruling 1: as características são trocadas por inteiro; virada, atacando etc. continuam valendo
              return { ...e, tokens: e.tokens.map((t) => ({ de: t.de, def: esc === 'gato' ? GATO : CAO })) };
            },
          }),
        },
        text: 'Se você fosse criar uma ou mais fichas, você pode em vez disso criar essa quantidade de fichas de criatura Cat 2/2 verdes com ímpeto ou essa quantidade de fichas de criatura Dog 3/1 verdes com vigilância.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: as fichas viram Cat ou Dog por inteiro, mas continuam viradas e atacando como o efeito mandava',
  },
});
