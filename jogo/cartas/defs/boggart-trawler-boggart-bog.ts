// Boggart Trawler // Boggart Bog
// Boggart Trawler — When this creature enters, exile target player's graveyard.
// Boggart Bog — As this land enters, you may pay 3 life. If you don't, it enters tapped. {T}: Add {B}.
import { defineCard, etb, exile, land, mana, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Boggart Trawler // Boggart Bog',
  faces: [
    {
      abilities: [
        etb(function* (c) {
          const p = tgtPlayer(c);
          if (p !== null && c.g.state.zones.graveyard[p].length) yield* exile(c.g, [...c.g.state.zones.graveyard[p]]);
        }, { targets: [t.player()], text: 'Quando esta criatura entra, exile o cemitério do jogador alvo.' }),
      ],
    },
    { abilities: [land.payLifeOrTapped(3), mana('B')] },
  ],
  rulings: {
    1: 'regra geral: CR 712.11 — permissão de jogar deixa escolher a face; "conjurar" só a mágica (motor/formatos.ts)',
    2: 'regra geral: CR 712.11a — só as características da face jogada contam',
    3: 'regra geral: CR 712.11 — efeito que deixa jogar terrenos aceita o verso de terreno (motor/formatos.ts)',
    4: 'regra geral: CR 712.8a — fora da pilha e do campo, só a frente (motor/formatos.ts)',
    5: 'regra geral: CR 712.8a — valor de mana pela face considerada (motor/chars.ts)',
    6: 'regra geral: CR 712.9 — carta modal não transforma (motor/formatos.ts)',
  },
});
