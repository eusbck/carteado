// Staff of the Storyteller
// When this artifact enters, create a 1/1 white Spirit creature token with flying.
// Whenever you create one or more creature tokens, put a story counter on this artifact.
// {W}, {T}, Remove a story counter from this artifact: Draw a card.
import { activated, addCounters, createTokens, defineCard, draw, etb, isCreature, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Staff of the Storyteller',
  faces: [{
    abilities: [
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Spirit 1/1', 1); }, { text: 'Quando este artefato entra, crie uma ficha de criatura Spirit branca 1/1 com voar.' }),
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'token' && e.player === c.you && !!c.g.state.objects[e.obj] && isCreature(c.g, e.obj))), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'story', 1, c.you);
      }, { text: 'Sempre que você cria uma ou mais fichas de criatura, coloque um marcador de história neste artefato.' }),
      activated('{W}, {T}, Remove a story counter from this artifact', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{W}, {T}, Remova um marcador de história deste artefato: Compre uma carta.' }),
    ],
  }],
});
