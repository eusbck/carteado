// Sam, Loyal Attendant
// Partner with Frodo, Adventurous Hobbit (When this creature enters, target player may put Frodo into their hand from
// their library, then shuffle.)
// At the beginning of combat on your turn, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this token:
// You gain 3 life.")
// Activated abilities of Foods you control cost {1} less to activate.
import { chars, controllerOf, createTokens, defineCard, on, staticAbility, triggered } from '../../motor/api.ts';
import { PARCEIROS } from '../condado.ts';
import { COMIDA } from '../tartarugas.ts';
import { parceiroCom } from '../vampiros.ts';

export default defineCard({
  name: 'Sam, Loyal Attendant',
  faces: [{
    abilities: [
      parceiroCom('Frodo, Adventurous Hobbit'),
      triggered(on.beginCombat('you'), function* (c) {
        yield* createTokens(c.g, c.you, 'Food', 1);
      }, { text: 'No início do combate no seu turno, crie uma ficha Food.' }),
      // CR 601.2f, 602.2b: a redução entra no custo total; só reduz a parte genérica ({2} da Food vira {1})
      staticAbility({
        rules: {
          abilityCostModifier: (c, jogador, fonte) => {
            const o = c.g.state.objects[fonte];
            if (jogador !== c.you || !o || o.zone !== 'battlefield' || controllerOf(c.g, fonte) !== c.you) return null;
            const ch = chars(c.g, fonte);
            return ch.types.includes('Artifact') && ch.subtypes.includes('Food') ? { reduce: 1 } : null;
          },
        },
        text: 'As habilidades ativadas das Foods que você controla custam {1} a menos para ativar.',
      }),
    ],
  }],
  rulings: {
    1: COMIDA.qualquer,
    2: COMIDA.tipo,
    3: COMIDA.qualquer,
    4: COMIDA.naoComa,
    5: PARCEIROS.comecam,
    6: PARCEIROS.doisSo,
    7: 'teste: ao entrar, o jogador alvo pode pôr o Frodo do grimório na mão',
    8: PARCEIROS.controla,
    9: PARCEIROS.gatilho,
    10: PARCEIROS.separados,
    11: PARCEIROS.busca,
    12: PARCEIROS.montagem,
    13: PARCEIROS.identidade,
  },
});
