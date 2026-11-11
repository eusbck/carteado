// Stonespeaker Crystal
// {T}: Add {C}{C}.
// {2}, {T}, Sacrifice this artifact: Exile any number of target players' graveyards. Draw a card.
import { activated, anyNumber, defineCard, draw, exile, mana, t, type PlayerId } from '../../motor/api.ts';

export default defineCard({
  name: 'Stonespeaker Crystal',
  faces: [{
    abilities: [
      mana('CC'),
      activated('{2}, {T}, Sacrifice this artifact', function* (c) {
        const jogadores = (c.targets[0] ?? []).filter((r) => r && r.kind === 'player' && !c.g.state.players[r.id].left).map((r) => r!.id as PlayerId);
        const cartas = jogadores.flatMap((p) => [...c.g.state.zones.graveyard[p]]);
        if (cartas.length) yield* exile(c.g, cartas);
        yield* draw(c.g, c.you, 1);
      }, { targets: [anyNumber(t.player(undefined, 'jogadores alvo'))], text: '{2}, {T}, Sacrifique este artefato: Exile os cemitérios de qualquer número de jogadores alvo. Compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: exila os cemitérios dos jogadores escolhidos como alvo e compra uma carta',
    2: 'teste: sem nenhum alvo, só compra uma carta',
  },
});
