// Nirkana Revenant
// Whenever you tap a Swamp for mana, add an additional {B}.
// {B}: This creature gets +1/+1 until end of turn.
import { activated, addMana, defineCard, isSubtype, on, staticAbility, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Nirkana Revenant',
  faces: [{
    abilities: [
      // habilidade de mana desencadeada (CR 605.1b): não usa a pilha; o gancho avisa o pagamento automático da mana a mais
      staticAbility({ rules: { extraManaForPlanning: (c, player, source, _produced, tapped) => (player === c.you && tapped && isSubtype(c.g, source, 'Swamp') ? ['B'] : []) } }),
      triggered(on.custom((e, c) => e.type === 'mana' && e.player === c.you && !!e.tappedForMana && !!c.g.state.objects[e.source] && isSubtype(c.g, e.source, 'Swamp')), function* (c) {
        addMana(c.g, c.you, ['B'], { source: c.source });
      }, { mana: true, text: 'Sempre que você vira um Swamp para gerar mana, adicione um {B} adicional.' }),
      activated('{B}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 1, t: 1 }]);
      }, { text: '{B}: Esta criatura recebe +1/+1 até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
