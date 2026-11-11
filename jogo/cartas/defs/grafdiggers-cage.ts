// Grafdigger's Cage
// Creature cards in graveyards and libraries can't enter the battlefield.
// Players can't cast spells from graveyards or libraries.
import { defineCard, printedChars, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Grafdigger's Cage",
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          // ruling 3: a carta é vista como está na zona (Phyrexian Metamorph é carta de criatura no cemitério); ruling 4:
          // manifestar do grimório é impossível com a Cage no campo
          cantEnterBattlefieldFrom: (c, card, _from, viradaParaBaixo) => {
            const o = c.g.state.objects[card];
            return !!o && (viradaParaBaixo || printedChars(o.copyOf?.def ?? o.def, 0, o.owner).types.includes('Creature'));
          },
          // rulings 1 e 2: terrenos podem ser jogados; a carta exilada de um grimório é conjurada do exílio
          cantCastFrom: (_c, _p, zona) => zona === 'graveyard' || zona === 'library',
        },
        text: 'Cartas de criatura em cemitérios e grimórios não podem entrar no campo. Os jogadores não podem conjurar mágicas de cemitérios ou grimórios.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 305.1 — jogar terreno não é conjurar; a Cage não impede (motor/priority.ts landPlayOptions)',
    2: 'regra geral: CR 601.2a — a carta exilada do grimório é conjurada do exílio (motor/priority.ts castOptions)',
    3: 'teste: carta de criatura do cemitério não entra no campo; carta que não é de criatura entra',
    4: 'teste: manifestar do grimório não acontece',
  },
});
