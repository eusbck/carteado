// The Borg Queen
// Artifact creatures you control get +2/+2.
// Whenever The Borg Queen enters or attacks, target opponent exiles cards from the top of their library until they
// exile a creature card. Assimilate that card. They put the rest on the bottom in a random order.
import { and, anthem, defineCard, exile, is, isCreature, moveObjects, on, t, triggered } from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';
import { assimilar } from '../borg.ts';
import { restoNoFundo } from '../veiculos.ts';

function* exilaAteCriatura(c: Ctx): Gen<void> {
  const alvo = c.targets[0]?.[0];
  if (!alvo || alvo.kind !== 'player') return;
  const p = alvo.id;
  const s = c.g.state;
  const resto: ObjId[] = [];
  let criatura: ObjId | null = null;
  while (s.zones.library[p].length) {
    const [ex] = yield* exile(c.g, [s.zones.library[p][0]]);
    if (ex === null || ex === undefined) break;
    if (isCreature(c.g, ex)) { criatura = ex; break; }
    resto.push(ex);
  }
  if (criatura !== null) yield* assimilar(c, criatura);
  // o resto volta do exílio para o fundo do grimório, em ordem aleatória
  const volta = resto.filter((id) => s.objects[id]?.zone === 'exile');
  const novos = yield* moveObjects(c.g, volta.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
  restoNoFundo(c.g, p, novos.filter((x): x is ObjId => x !== null));
}

const TEXTO = 'o oponente alvo exila cartas do topo do grimório até exilar uma carta de criatura. Assimile essa carta. Ele põe o resto no fundo em ordem aleatória.';

export default defineCard({
  name: 'The Borg Queen',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.artifact, is.yours), () => [{ k: 'pt', p: 2, t: 2 }], 'As criaturas-artefato que você controla recebem +2/+2.'),
      triggered(on.selfEnters(), exilaAteCriatura, { targets: [t.opponent()], text: `Sempre que The Borg Queen entra ou ataca, ${TEXTO}` }),
      triggered(on.selfAttacks(), exilaAteCriatura, { targets: [t.opponent()], text: `Sempre que The Borg Queen ataca, ${TEXTO}` }),
    ],
  }],
  rulings: {},
});
