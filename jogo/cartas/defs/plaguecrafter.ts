// Plaguecrafter
// When this creature enters, each player sacrifices a creature or planeswalker of their choice. Each player who can't
// discards a card.
import { chooseItems, controlledBy, defineCard, discard, etb, isType, nameOf, objItem, sacrifice } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Plaguecrafter',
  faces: [{
    abilities: [
      etb(function* (c) {
        // ruling 1: em ordem APNAP cada um escolhe; sacrificam juntos; depois, quem não pôde descarta
        const escolhidos: ObjId[] = [];
        const semNada: PlayerId[] = [];
        for (const p of c.g.apnap().filter((x) => !c.g.state.players[x].left)) {
          const meus = controlledBy(c.g, p, (id) => isType(c.g, id, 'Creature') || isType(c.g, id, 'Planeswalker'));
          if (!meus.length) { semNada.push(p); continue; }
          const [esc] = meus.length === 1 ? [String(meus[0])] : yield* chooseItems(c.g, p, 'Plaguecrafter: sacrifique uma criatura ou um planeswalker', meus.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          escolhidos.push(Number(esc));
        }
        yield* sacrifice(c.g, escolhidos);
        for (const p of semNada) yield* discard(c.g, p, 1);
      }, { text: 'Quando esta criatura entra, cada jogador sacrifica uma criatura ou um planeswalker à escolha dele. Cada jogador que não puder descarta uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: cada jogador sacrifica uma criatura ou planeswalker; quem não tem descarta uma carta',
    2: 'regra geral: cada jogador escolhe entre as próprias criaturas e planeswalkers (chooseItems na resolução)',
    3: 'teste: Ana, sem outra criatura, sacrifica o próprio Plaguecrafter',
  },
});
