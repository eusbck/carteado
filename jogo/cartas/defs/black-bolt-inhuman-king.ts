// Black Bolt, Inhuman King
// Flying
// Whenever you cast a noncreature spell, Black Bolt gets +2/+2 until end of turn.
// Lethal Voice — Whenever Black Bolt becomes the target of a spell or ability an opponent controls, destroy target
// nonland permanent that player controls.
import { controllerOf, defineCard, destroy, keyword, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { aoConjurarNaoCriatura } from '../quarteto.ts';

export default defineCard({
  name: 'Black Bolt, Inhuman King',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(aoConjurarNaoCriatura(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 2, t: 2 }]);
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura, Black Bolt recebe +2/+2 até o fim do turno.' }),
      // mirado mais de uma vez pela mesma mágica ou habilidade, dispara uma vez (CR 603.2c)
      triggered(on.batch((evs, c) => {
        const vistos = new Set<number>();
        const out: Record<string, unknown>[] = [];
        for (const e of evs) {
          if (e.type !== 'target' || e.target.kind !== 'obj' || e.target.id !== c.source || !c.g.isOpponent(c.you, e.controller) || vistos.has(e.by)) continue;
          vistos.add(e.by);
          out.push({ jogador: e.controller });
        }
        return out;
      }), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, {
        targets: [t.nonlandPermanent((c, id) => controllerOf(c.g, id) === (c.event?.jogador as PlayerId | undefined), 'permanente não terreno alvo que esse jogador controla')],
        text: 'Voz Letal — Sempre que Black Bolt se torna alvo de uma mágica ou habilidade que um oponente controla, destrua o permanente não terreno alvo que esse jogador controla.',
      }),
    ],
  }],
  rulings: {},
});
