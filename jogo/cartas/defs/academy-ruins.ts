// Academy Ruins
// {T}: Add {C}.
// {1}{U}, {T}: Put target artifact card from your graveyard on top of your library.
import { activated, defineCard, is, mana, moveObjects, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Academy Ruins',
  faces: [{
    abilities: [
      mana('C'),
      activated('{1}{U}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'library', position: 'top' }], 'effect');
      }, { targets: [t.card('graveyard', is.artifact, 'carta de artefato alvo do seu cemitério', 'you')], text: '{1}{U}, {T}: Coloque a carta de artefato alvo do seu cemitério no topo do seu grimório.' }),
    ],
  }],
  rulings: {},
});
