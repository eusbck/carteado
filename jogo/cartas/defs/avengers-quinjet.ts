// Avengers Quinjet
// Flying
// Whenever this Vehicle enters or attacks, choose one —
// • You may put a Hero creature card from your hand onto the battlefield.
// • Return target Hero creature card from your graveyard to your hand.
// Crew 3
import { chars, chooseItems, crew, defineCard, keyword, modal, moveObjects, nameOf, objItem, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import { ehHeroi } from '../vingadores.ts';

const cartaDeHeroiCriatura = (g: G, id: number): boolean => chars(g, id).types.includes('Creature') && ehHeroi(g, id);

export default defineCard({
  name: 'Avengers Quinjet',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          {
            text: 'Você pode pôr no campo uma carta de criatura Hero da sua mão',
            *effect(c) {
              const cartas = c.g.state.zones.hand[c.you].filter((id) => cartaDeHeroiCriatura(c.g, id));
              if (!cartas.length) return;
              const esc = yield* chooseItems(c.g, c.you, 'Avengers Quinjet: você pode pôr no campo uma criatura Hero da mão', cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
              if (esc.length) yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you }], 'put');
            },
          },
          {
            text: 'Devolva a carta de criatura Hero alvo do seu cemitério para a sua mão',
            targets: [t.card('graveyard', (c, id) => cartaDeHeroiCriatura(c.g, id), 'carta de criatura Hero alvo no seu cemitério')],
            *effect(c) { const id = tgt(c); if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect'); },
          },
        ]),
        text: 'Sempre que este Veículo entra ou ataca, escolha um — você pode pôr no campo uma carta de criatura Hero da sua mão; ou devolva a carta de criatura Hero alvo do seu cemitério para a sua mão.',
      }),
      crew(3),
    ],
  }],
  rulings: {},
});