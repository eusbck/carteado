// Emeria Shepherd
// Flying
// Landfall — Whenever a land you control enters, you may return target nonland permanent card from your graveyard to your
// hand. If that land is a Plains, you may return that nonland permanent card to the battlefield instead.
import { and, chooseOne, controllerOf, defineCard, is, isLand, keyword, lkiChars, moveObjects, nameOf, on, putOntoBattlefield, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Emeria Shepherd',
  faces: [{
    abilities: [
      keyword('flying'),
      // queda de terreno (CR 207.2c): um terreno que você controla entra
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && !!c.g.state.objects[e.obj] && isLand(c.g, e.obj) && controllerOf(c.g, e.obj) === c.you ? { terreno: e.obj } : false)), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // a Plains é conferida na resolução, ou como o terreno estava por último no campo
        const plains = !!lkiChars(c.g, c.event.terreno as ObjId)?.subtypes.includes('Plains');
        const opcoes = [{ id: 'mao', label: `Devolver ${nameOf(c.g, id)} para a mão` }];
        if (plains) opcoes.push({ id: 'campo', label: `Devolver ${nameOf(c.g, id)} ao campo` });
        opcoes.push({ id: 'nao', label: 'Não devolver' });
        const esc = yield* chooseOne(c.g, c.you, 'Emeria Shepherd: o que fazer?', opcoes);
        if (esc === 'mao') yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
        else if (esc === 'campo') yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        targets: [t.card('graveyard', and(is.permanentCard, is.nonland), 'carta de permanente não terreno alvo do seu cemitério')],
        text: 'Queda de terreno — Sempre que um terreno que você controla entra, você pode devolver a carta de permanente não terreno alvo do seu cemitério para a sua mão. Se esse terreno for uma Plains, você pode devolver essa carta ao campo em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: jogar um terreno ou pô-lo no campo por efeito faz disparar',
    2: 'regra geral: CR 603.6a — um permanente que vira terreno não "entra"',
    3: 'regra geral: CR 603.3b — com outros gatilhos de terraformação, você escolhe a ordem',
    4: 'teste: só cartas de permanente não terreno',
    5: 'regra geral: CR 303.4a — uma Aura posta no campo assim escolhe o que encantar sem mirar (motor/actions.ts putOntoBattlefield)',
  },
});
