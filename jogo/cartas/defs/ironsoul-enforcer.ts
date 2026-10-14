// Ironsoul Enforcer
// Whenever this creature or a commander you control attacks alone, return target artifact card from your graveyard to
// the battlefield.
import { controllerOf, defineCard, is, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

export default defineCard({
  name: 'Ironsoul Enforcer',
  faces: [{
    abilities: [
      // CR 506.5: ataca sozinha quando é a única criatura declarada atacante no combate
      triggered(on.custom((e, c) => e.type === 'attackers' && e.attackers.length === 1
        && (e.attackers[0].obj === c.source || (ehComandante(c.g, e.attackers[0].obj) && controllerOf(c.g, e.attackers[0].obj) === c.you))), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [t.card('graveyard', is.artifact, 'carta de artefato alvo no seu cemitério')],
        text: 'Sempre que esta criatura ou um comandante que você controla ataca sozinho, devolva a carta de artefato alvo do seu cemitério para o campo.',
      }),
    ],
  }],
  rulings: {},
});
