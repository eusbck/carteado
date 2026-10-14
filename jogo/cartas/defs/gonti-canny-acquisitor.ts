// Gonti, Canny Acquisitor
// Spells you cast but don't own cost {1} less to cast.
// Whenever one or more creatures you control deal combat damage to a player, look at the top card of that player's
// library, then exile it face down. You may play that card for as long as it remains exiled, and mana of any type can
// be spent to cast that spell.
import { defineCard, isCreature, staticAbility, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';
import { exilaTopoViradoJogavel, magicaDeOutroDono, ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Gonti, Canny Acquisitor',
  faces: [{
    abilities: [
      // CR 601.2f: redução do genérico do custo total
      staticAbility({
        rules: { costModifier: (c, sp) => (sp.controller === c.you && magicaDeOutroDono(c, sp.obj) ? { reduce: 1 } : null) },
        text: 'As mágicas que você conjura mas não possui custam {1} a menos para serem conjuradas.',
      }),
      // um gatilho por jogador que tomou dano de combate de criaturas suas no mesmo lote
      triggered(seusCausamDanoDeCombate((c, id) => isCreature(c.g, id)), function* (c) {
        yield* exilaTopoViradoJogavel(c, c.event.jogador as PlayerId);
      }, {
        text: 'Sempre que uma ou mais criaturas que você controla causam dano de combate a um jogador, olhe a carta do topo do grimório desse jogador e exile-a virada para baixo. Você pode jogar essa carta enquanto ela continuar exilada, e mana de qualquer tipo pode ser gasta para conjurá-la.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: você joga a carta exilada com mana de qualquer tipo, mesmo depois de Gonti sair do campo',
    2: 'teste: um terreno exilado assim se joga como a jogada de terreno do turno',
    3: ROUBO.sai,
    4: ROUBO.saiuDaPartida,
  },
});
