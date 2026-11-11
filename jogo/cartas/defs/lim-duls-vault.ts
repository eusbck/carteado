// Lim-Dûl's Vault
// Look at the top five cards of your library. As many times as you choose, you may pay 1 life, put those cards on the
// bottom of your library in any order, then look at the top five cards of your library. Then shuffle and put the last
// cards you looked at this way on top in any order.
import { defineCard, loseLife, nameOf, shuffleLibrary, yesNo } from '../../motor/api.ts';
import { emQualquerOrdem } from '../cedh.ts';

export default defineCard({
  name: "Lim-Dûl's Vault",
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const s = g.state;
        let olhadas = s.zones.library[c.you].slice(0, 5);
        // ruling 1: olhe; se não gostar, pague 1 de vida, ponha-as no fundo na ordem que quiser e olhe as cinco seguintes
        // ruling 3: com cinco ou menos cartas, pode pagar quanto quiser, mas vê as mesmas cartas
        for (let guarda = 0; guarda < 200 && olhadas.length; guarda++) {
          if (s.players[c.you].life < 1) break; // CR 119.4
          const nomes = olhadas.map((id) => nameOf(g, id)).join(', ');
          if (!(yield* yesNo(g, c.you, `Lim-Dûl's Vault: você olhou ${nomes}. Pagar 1 de vida e pôr essas cartas no fundo do grimório para olhar as cinco seguintes?`, 'Pagar 1 de vida', 'Ficar com estas'))) break;
          loseLife(g, c.you, 1, c.source);
          const ordem = yield* emQualquerOrdem(g, c.you, olhadas, "Lim-Dûl's Vault: ordem das cartas no fundo do grimório (a primeira fica mais acima)", 'bottom');
          const resto = s.zones.library[c.you].filter((id) => !olhadas.includes(id));
          s.zones.library[c.you] = [...resto, ...ordem];
          g.bump();
          olhadas = s.zones.library[c.you].slice(0, 5);
        }
        // ruling 2: embaralha o resto e põe as últimas olhadas no topo, na ordem que quiser
        const ordem = yield* emQualquerOrdem(g, c.you, olhadas, "Lim-Dûl's Vault: ordem das cartas no topo do grimório (a primeira fica no topo)", 'top');
        s.zones.library[c.you] = s.zones.library[c.you].filter((id) => !olhadas.includes(id));
        shuffleLibrary(g, c.you);
        s.zones.library[c.you] = [...ordem, ...s.zones.library[c.you]];
        g.bump();
      },
    },
  }],
  rulings: {
    1: 'teste: pagando 1 de vida, as cinco vão para o fundo e você olha as cinco seguintes',
    2: 'teste: sem pagar vida, as cinco do topo ficam no topo na ordem escolhida',
    3: 'regra geral: CR 119.4 — com cinco ou menos cartas no grimório as mesmas voltam ao topo; pode pagar enquanto tiver vida',
  },
});
