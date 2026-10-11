// Negative Zone Portal
// {2}, {T}: Exile target card from an opponent's graveyard. If it's a creature card, draw a card.
// At the beginning of your upkeep, if there are four or more creature cards exiled with this artifact, flip a coin. If
// you lose the flip, sacrifice this artifact and return a card exiled with it at random to its owner's hand.
import { activated, defineCard, draw, exile, flipCoin, isCreature, linkedExiled, moveObjects, on, sacrifice, t, tgt, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

const CHAVE = 'portal';
const criaturasExiladas = (g: G, id: ObjId): number => linkedExiled(g, id, CHAVE).filter((x) => isCreature(g, x)).length;

export default defineCard({
  name: 'Negative Zone Portal',
  faces: [{
    abilities: [
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // é carta de criatura? olha antes de exilar; a carta fica vinculada ao artefato (CR 607.2a)
        const criatura = isCreature(c.g, id);
        const [ex] = yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
        if (ex !== null && ex !== undefined && criatura) yield* draw(c.g, c.you, 1);
      }, { targets: [t.card('graveyard', undefined, 'carta alvo do cemitério de um oponente', 'opponent')], text: '{2}, {T}: Exile a carta alvo do cemitério de um oponente. Se for uma carta de criatura, compre uma carta.' }),
      // cláusula "se" interveniente (CR 603.4): conferida ao disparar e ao resolver
      triggered(on.upkeep('you'), function* (c) {
        if (flipCoin(c.g, c.you)) return;
        // perdeu: sacrifica e devolve uma carta exilada com ele, ao acaso, para a mão do dono
        const exiladas = linkedExiled(c.g, c.source, CHAVE);
        yield* sacrifice(c.g, [c.source]);
        if (!exiladas.length) return;
        const [sorteada] = shuffle(c.g.state.rng, [...exiladas]);
        yield* moveObjects(c.g, [{ id: sorteada, to: 'hand' }], 'effect');
      }, {
        condition: (c) => criaturasExiladas(c.g, c.source) >= 4,
        text: 'No início da sua manutenção, se houver quatro ou mais cartas de criatura exiladas com este artefato, jogue cara ou coroa. Se perder, sacrifique este artefato e devolva uma carta exilada com ele, ao acaso, para a mão do dono.',
      }),
    ],
  }],
  rulings: {},
});
