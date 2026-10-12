// Out of the Tombs
// At the beginning of your upkeep, put two eon counters on this enchantment, then mill cards equal to the number of eon
// counters on it.
// If you would draw a card while your library has no cards in it, instead return a creature card from your graveyard to
// the battlefield. If you can't, you lose the game.
import { addCounters, chars, chooseItems, defineCard, mill, nameOf, objItem, on, putOntoBattlefield, staticAbility, triggered } from '../../motor/api.ts';
import { loseGame } from '../../motor/sba.ts';

export default defineCard({
  name: 'Out of the Tombs',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'battlefield') return;
        addCounters(c.g, { kind: 'obj', id: c.source }, 'eon', 2, c.you);
        const n = c.g.state.objects[c.source]?.counters.eon ?? 0;
        if (n > 0) yield* mill(c.g, c.you, n);
      }, { text: 'No início da sua manutenção, coloque dois marcadores de éon neste encantamento e depois triture cartas iguais ao número de marcadores de éon nele.' }),
      // CR 614.1a: substituição da compra, só com o seu grimório vazio; ruling 1: vale para cada carta comprada
      staticAbility({
        rules: {
          drawReplaceApplies: (c, jogador) => jogador === c.you && c.g.state.zones.library[jogador].length === 0,
          drawReplace: function* (c, jogador) {
            const cartas = c.g.state.zones.graveyard[jogador].filter((id) => chars(c.g, id).types.includes('Creature'));
            if (!cartas.length) { loseGame(c.g, jogador); return; }
            const [esc] = yield* chooseItems(c.g, jogador, 'Out of the Tombs: em vez de comprar, devolva ao campo uma carta de criatura do seu cemitério', cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
            yield* putOntoBattlefield(c.g, [{ id: Number(esc), controller: jogador }], 'effect');
          },
        },
        text: 'Se você fosse comprar uma carta enquanto o seu grimório não tem cartas, em vez disso devolva ao campo de batalha uma carta de criatura do seu cemitério. Se não puder, você perde o jogo.',
      }),
    ],
  }],
  rulings: { 1: 'teste: com o grimório vazio, cada compra vira devolver uma criatura do cemitério ao campo; sem criatura, você perde o jogo' },
});