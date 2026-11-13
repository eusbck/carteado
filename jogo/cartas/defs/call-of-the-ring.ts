// Call of the Ring
// At the beginning of your upkeep, the Ring tempts you.
// Whenever you choose a creature as your Ring-bearer, you may pay 2 life. If you do, draw a card.
import { defineCard, draw, loseLife, on, ringTempts, triggered, yesNo } from '../../motor/api.ts';
import { ANEL } from '../mordor.ts';

export default defineCard({
  name: 'Call of the Ring',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) { yield* ringTempts(c.g, c.you); }, { text: 'No início da sua manutenção, o Anel tenta você.' }),
      // rulings 1-2: dispara a cada escolha, mesmo do mesmo Portador; sem criatura para escolher, não dispara
      triggered(on.custom((e, c) => e.type === 'ringTempts' && e.player === c.you && e.bearer !== null), function* (c) {
        // pagar vida só com vida suficiente (CR 119.4)
        if (c.g.state.players[c.you].life < 2) return;
        if (!(yield* yesNo(c.g, c.you, 'Call of the Ring: pagar 2 de vida para comprar uma carta?'))) return;
        loseLife(c.g, c.you, 2, c.source);
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você escolhe uma criatura como seu Portador do Anel, você pode pagar 2 de vida. Se fizer isso, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: escolher de novo o mesmo Portador do Anel dispara de novo',
    2: 'teste: sem criatura para escolher, o Anel tenta mas a segunda habilidade não dispara',
    3: ANEL.emblema,
    4: 'teste: sem criatura para escolher, o Anel tenta mas a segunda habilidade não dispara',
    5: 'teste: escolher de novo o mesmo Portador do Anel dispara de novo',
    6: ANEL.ordem,
    7: ANEL.obrigatorio,
    8: ANEL.um,
    9: ANEL.alvos,
  },
});
