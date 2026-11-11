// Jurati, Cordial Queen
// Whenever one or more artifact creatures you control deal combat damage to a player, create a token that's a copy of
// target artifact token you control.
import { and, controllerOf, copiableValues, createTokens, defineCard, is, on, t, tgt, triggered } from '../../motor/api.ts';
import { artefatoCriatura } from '../borg.ts';

export default defineCard({
  name: 'Jurati, Cordial Queen',
  faces: [{
    abilities: [
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'damage' && e.combat && e.target.kind === 'player'
        && !!c.g.state.objects[e.source] && artefatoCriatura(c.g, e.source) && controllerOf(c.g, e.source) === c.you)), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
      }, {
        targets: [t.artifact(and(is.token, is.yours), 'ficha de artefato alvo que você controla')],
        text: 'Sempre que uma ou mais criaturas-artefato que você controla causam dano de combate a um jogador, crie uma ficha que é uma cópia da ficha de artefato alvo que você controla.',
      }),
    ],
  }],
  rulings: {},
});
