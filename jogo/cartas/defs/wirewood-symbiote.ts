// Wirewood Symbiote
// Return an Elf you control to its owner's hand: Untap target creature. Activate only once each turn.
import { activated, defineCard, t, tgt, untap } from '../../motor/api.ts';

export default defineCard({
  name: 'Wirewood Symbiote',
  faces: [{
    abilities: [
      // ruling 1: devolver o Elfo é o custo (CR 602.2b); ruling 2: qualquer criatura, virada ou não
      activated("Return an Elf you control to its owner's hand", function* (c) {
        const id = tgt(c);
        if (id !== null) untap(c.g, id);
      }, { targets: [t.creature()], oncePerTurn: true, text: 'Devolva um Elfo que você controla à mão do dono: Desvire a criatura alvo. Ative somente uma vez por turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: devolve um Elfo como custo e desvira a criatura alvo; só uma vez por turno',
    2: 'regra geral: CR 115.1 — o alvo é qualquer criatura, virada ou não (t.creature)',
  },
});
