// Redemption Arc
// Enchant creature
// Enchanted creature has indestructible and is goaded.
// {1}{W}: Exile enchanted creature.
import { activated, attachedGets, defineCard, exile, goadsEnchanted, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Redemption Arc',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'indestructible' }], 'A criatura encantada tem indestrutível.'),
      // goad pelo controlador da Aura (motor: exigências de ataque, CR 701.15b)
      goadsEnchanted(),
      activated('{1}{W}', function* (c) {
        const enc = c.g.state.objects[c.source]?.attachedTo;
        if (enc != null && c.g.state.objects[enc]?.zone === 'battlefield') yield* exile(c.g, [enc]);
      }, { text: '{1}{W}: Exile a criatura encantada.' }),
    ],
  }],
  rulings: {
  },
});
