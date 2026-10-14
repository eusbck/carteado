// Aerial Surveyor
// Flying
// Whenever this Vehicle attacks, if defending player controls more lands than you, search your library for a basic
// Plains card, put it onto the battlefield tapped, then shuffle.
// Crew 2
import { controlledBy, controllerOf, crew, defineCard, fetchBasicToBattlefield, isLand, isSubtype, keyword, on, triggered, type SCtx } from '../../motor/api.ts';
import type { PlayerId, TargetRef } from '../../motor/types.ts';

/** o jogador defensor de quem esta criatura ataca (CR 506.2): o atacado, ou o controlador do planeswalker atacado */
function defensor(c: SCtx): PlayerId | null {
  const a = c.g.state.combat?.attackers.find((x) => x.id === c.source && !x.removed);
  const alvo: TargetRef | undefined = a?.target;
  if (!alvo) return null;
  return alvo.kind === 'player' ? alvo.id : controllerOf(c.g, alvo.id);
}

const terrenos = (c: SCtx, p: PlayerId) => controlledBy(c.g, p, (id) => isLand(c.g, id)).length;

export default defineCard({
  name: 'Aerial Surveyor',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 603.4: "se" interveniente, conferido ao disparar e ao resolver (ruling 1)
      triggered(on.selfAttacks(), function* (c) {
        yield* fetchBasicToBattlefield(c, 1, { tapped: true, filter: (id) => isSubtype(c.g, id, 'Plains'), prompt: 'Procure uma carta de Plains básica' });
      }, {
        condition: (c) => { const d = defensor(c); return d !== null && terrenos(c, d) > terrenos(c, c.you); },
        text: 'Sempre que este Veículo ataca, se o jogador defensor controla mais terrenos que você, procure no seu grimório uma carta de Plains básica, coloque-a no campo virada e depois embaralhe.',
      }),
      crew(2),
    ],
  }],
  rulings: {
    1: 'teste: atacando quem tem mais terrenos, busca uma Plains virada; com terrenos iguais, não',
  },
});
