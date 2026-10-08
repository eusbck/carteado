// Fallen Ideal
// Enchant creature
// Enchanted creature has flying and "Sacrifice a creature: This creature gets +2/+1 until end of turn."
// When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.
import { activated, attachedGets, defineAbility, defineCard, moveObjects, on, t, triggered, untilEndOfTurn } from '../../motor/api.ts';

// habilidade concedida à criatura: quem a ativa é o controlador da criatura (ruling 1)
const SACRIFICA = defineAbility('Fallen Ideal:sacrifica', activated('Sacrifice a creature', function* (c) {
  if (c.g.state.objects[c.source]) untilEndOfTurn(c, [c.source], [{ k: 'pt', p: 2, t: 1 }]);
}, { text: 'Sacrifique uma criatura: Esta criatura recebe +2/+1 até o fim do turno.' }));

export default defineCard({
  name: 'Fallen Ideal',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'flying' }, { k: 'addAbility', id: SACRIFICA.id! }], 'A criatura encantada tem voar e "Sacrifique uma criatura: Esta criatura recebe +2/+1 até o fim do turno."'),
      triggered(on.custom((e, c) => e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old === c.source ? { carta: e.obj } : false), function* (c) {
        const id = c.event.carta as number;
        if (c.g.state.objects[id]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, { text: 'Quando esta Aura vai do campo para um cemitério, devolva-a para a mão do dono.' }),
    ],
  }],
  rulings: { 1: 'teste: quem ativa é o controlador da criatura' },
});
