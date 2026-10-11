// Cosmic Crucible
// At the beginning of your first main phase, add four mana in any combination of colors.
// Whenever you cast a noncreature spell, you may copy it. You may choose new targets for the copy. Do this only once each
// turn. (A copy of a permanent spell becomes a token.)
import { addMana, chooseItems, copySpell, defineCard, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import type { Color, ObjId } from '../../motor/types.ts';
import { aoConjurarNaoCriatura } from '../quarteto.ts';

const CORES: [Color, string][] = [['W', 'Branco {W}'], ['U', 'Azul {U}'], ['B', 'Preto {B}'], ['R', 'Vermelho {R}'], ['G', 'Verde {G}']];

export default defineCard({
  name: 'Cosmic Crucible',
  faces: [{
    abilities: [
      triggered(on.firstMain(), function* (c) {
        // quatro manas, cada uma da cor que você quiser
        const cores: Color[] = [];
        for (let i = 0; i < 4; i++) {
          const [esc] = yield* chooseItems(c.g, c.you, `Cosmic Crucible: cor da mana ${i + 1} de 4`, CORES.map(([id, label]) => ({ id, label })), 1, 1);
          cores.push(esc as Color);
        }
        addMana(c.g, c.you, cores, { source: c.source });
      }, { text: 'No início da sua primeira fase principal, adicione quatro manas em qualquer combinação de cores.' }),
      triggered(aoConjurarNaoCriatura(), function* (c) {
        const s = c.g.state;
        const eu = s.objects[c.source];
        // "faça isso só uma vez por turno": conta quando você de fato copia
        if (!eu || eu.data.crucibleTurno === s.turn.number) return;
        const magica = c.event.spell as ObjId;
        if (!(yield* yesNo(c.g, c.you, `Cosmic Crucible: copiar ${nameOf(c.g, magica)}? (só uma vez por turno)`))) return;
        eu.data.crucibleTurno = s.turn.number;
        // CR 707.10f, 608.3f: a cópia de uma mágica de permanente vira ficha ao resolver
        yield* copySpell(c.g, magica, c.you, { newTargets: true });
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura, você pode copiá-la. Você pode escolher novos alvos para a cópia. Faça isso só uma vez por turno.' }),
    ],
  }],
  rulings: {},
});
