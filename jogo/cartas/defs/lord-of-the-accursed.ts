// Lord of the Accursed
// Other Zombies you control get +1/+1.
// {1}{B}, {T}: All Zombies gain menace until end of turn.
import { activated, allCreatures, anthem, controllerOf, defineCard, isCreature, isSubtype, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Lord of the Accursed',
  faces: [{
    abilities: [
      anthem((c, id) => id !== c.source && isCreature(c.g, id) && isSubtype(c.g, id, 'Zombie') && controllerOf(c.g, id) === c.you,
        () => [{ k: 'pt', p: 1, t: 1 }], 'Os outros Zombies que você controla recebem +1/+1.'),
      activated('{1}{B}, {T}', function* (c) {
        // todos os Zombies no campo (de qualquer jogador), conjunto travado na resolução (CR 611.2c)
        untilEndOfTurn(c, allCreatures(c.g).filter((id) => isSubtype(c.g, id, 'Zombie')), [{ k: 'addKeyword', kw: 'menace' }]);
      }, { text: '{1}{B}, {T}: Todos os Zombies ganham ameaça até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
