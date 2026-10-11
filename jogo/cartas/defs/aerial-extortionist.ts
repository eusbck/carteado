// Aerial Extortionist
// Flying
// Whenever this creature enters or deals combat damage to a player, exile up to one target nonland permanent. For as long
// as that card remains exiled, its owner may cast it.
// Whenever another player casts a spell from anywhere other than their hand, draw a card.
import { allowPlay, defineCard, draw, exile, keyword, on, t, tgt, triggered, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Aerial Extortionist',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source)
        || (e.type === 'damage' && e.combat && e.source === c.source && e.target.kind === 'player')), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const dono = c.g.state.objects[id].owner;
        const [ex] = yield* exile(c.g, [id]);
        // a ficha exilada deixa de existir (CR 111.7); a carta, só o dono pode conjurar, pagando os custos
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return;
        allowPlay(c.g, dono, c.source, [ex], { kind: 'permanent' }, { spellsOnly: true });
      }, {
        targets: [upTo(1, t.nonlandPermanent())],
        text: 'Sempre que esta criatura entra ou causa dano de combate a um jogador, exile até uma permanente alvo que não é terreno. Enquanto essa carta continuar exilada, o dono dela pode conjurá-la.',
      }),
      triggered(on.custom((e, c) => e.type === 'cast' && !e.copy && e.player !== c.you && e.from !== 'hand'), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que outro jogador conjura uma mágica de qualquer lugar que não a mão dele, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
