// Dream-Thief's Bandana
// Whenever equipped creature deals combat damage to a player, look at the top card of their library, then exile it face
// down. For as long as it remains exiled, you may play it, and mana of any type can be spent to cast that spell.
// Equip {1}
import { defineCard, equip, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { anexadaCausaDanoDeCombateAJogador } from '../jin.ts';
import { exilaTopoViradoJogavel, ROUBO } from '../roubo.ts';

export default defineCard({
  name: "Dream-Thief's Bandana",
  faces: [{
    abilities: [
      triggered(anexadaCausaDanoDeCombateAJogador(), function* (c) {
        yield* exilaTopoViradoJogavel(c, c.event.jogador as PlayerId);
      }, {
        text: 'Sempre que a criatura equipada causa dano de combate a um jogador, olhe a carta do topo do grimório dele e exile-a virada para baixo. Enquanto ela continuar exilada, você pode jogá-la, e mana de qualquer tipo pode ser gasta para conjurá-la.',
      }),
      equip('{1}'),
    ],
  }],
  rulings: {
    1: 'teste: você joga a carta exilada com mana de qualquer tipo, mesmo depois de a Bandana sair do campo',
    2: ROUBO.tempo,
    3: ROUBO.sai,
    4: ROUBO.saiuDaPartida,
  },
});
