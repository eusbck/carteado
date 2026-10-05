// Angelic Destiny
// Enchant creature
// Enchanted creature gets +4/+4, has flying and first strike, and is an Angel in addition to its other types.
// When enchanted creature dies, return this card to its owner's hand.
import { attachedGets, defineCard, moveObjects, on, t, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Angelic Destiny',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 4, t: 4 }, { k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'first strike' }, { k: 'addTypes', subtypes: ['Angel'] }],
        'A criatura encantada recebe +4/+4, tem voar e primeiro golpe e é um Angel além dos outros tipos.'),
      triggered(on.dies((c, _l, o) => c.obj.attachedTo === o.id), function* (c) {
        // a Aura vai ao cemitério pelas ações de estado; ruling 2: só volta se ainda estiver lá
        const novo = c.g.state.lki[c.source]?.newId ?? null;
        if (novo !== null && c.g.state.objects[novo]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id: novo, to: 'hand' }], 'effect');
      }, { text: 'Quando a criatura encantada morre, devolva esta carta para a mão do dono.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.3b — Aura com alvo ilegal não entra, então não há gatilho',
    2: 'teste: volta à mão quando a criatura encantada morre',
  },
});
