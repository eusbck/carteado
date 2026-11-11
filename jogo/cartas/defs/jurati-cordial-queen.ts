// Jurati, Cordial Queen
// Whenever one or more artifact creatures you control deal combat damage to a player, create a token that's a copy of
// target artifact token you control.
import { and, copiableValues, createTokens, defineCard, is, t, tgt, triggered } from '../../motor/api.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';
import { criaturaArtefato } from '../borg.ts';

export default defineCard({
  name: 'Jurati, Cordial Queen',
  faces: [{
    abilities: [
      // um disparo por jogador que tomou o dano de combate no mesmo lote (CR 603.2c)
      triggered(seusCausamDanoDeCombate(criaturaArtefato), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
      }, {
        targets: [t.artifact(and(is.token, is.yours), 'ficha de artefato alvo que você controla')],
        text: 'Sempre que uma ou mais criaturas artefato que você controla causam dano de combate a um jogador, crie uma ficha que é uma cópia da ficha de artefato alvo que você controla.',
      }),
    ],
  }],
  rulings: {},
});
