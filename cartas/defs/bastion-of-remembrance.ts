// Bastion of Remembrance
// When this enchantment enters, create a 1/1 white Human Soldier creature token.
// Whenever a creature you control dies, each opponent loses 1 life and you gain 1 life.
import { createTokens, defineCard, etb, gainLife, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Bastion of Remembrance',
  faces: [{
    abilities: [
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Human Soldier', 1); }, { text: 'Quando este encantamento entra, crie uma ficha de criatura Human Soldier branca 1/1.' }),
      triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma criatura que você controla morre, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: Gigante de Duas Cabeças está fora do escopo',
    2: 'teste: CR 603.10a: se sai do campo junto com as criaturas, dispara para cada uma',
    3: 'regra geral: CR 704.3 — ações de estado (derrota com 0 de vida) antes de pôr o gatilho na pilha',
  },
});
