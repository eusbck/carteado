// Everett K. Ross, Hapless Attaché
// Commander creatures you control get +1/+1 and have lifelink.
// Whenever an opponent attacks you with two or more creatures, draw a card.
import { controllerOf, defineCard, draw, isCreature, on, staticAbility, triggered } from '../../motor/api.ts';
import { ehComandanteDe } from '../wakanda.ts';

export default defineCard({
  name: 'Everett K. Ross, Hapless Attaché',
  faces: [{
    abilities: [
      // "criaturas comandantes que você controla": as que são comandantes, de quem forem
      staticAbility({
        affects: (c, o) => o.zone === 'battlefield' && o.card !== null && !!c.g.state.cards[o.card]?.isCommander && isCreature(c.g, o.id) && controllerOf(c.g, o.id) === c.you,
        mods: () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'lifelink' }],
        text: 'As criaturas comandantes que você controla recebem +1/+1 e têm vínculo com a vida.',
      }),
      triggered(on.custom((e, c) => e.type === 'attackers' && c.g.isOpponent(c.you, e.player) && e.attackers.filter((a) => a.target.kind === 'player' && a.target.id === c.you).length >= 2), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um oponente ataca você com duas ou mais criaturas, compre uma carta.' }),
    ],
  }],
  rulings: {},
});