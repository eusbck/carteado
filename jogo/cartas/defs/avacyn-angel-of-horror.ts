// Avacyn, Angel of Horror
// Flying, deathtouch
// Whenever Avacyn or another nontoken creature you control dies, return that card to the battlefield under your control
// at the beginning of the next end step.
import { defineAbility, defineCard, delayed, keywords, nextEndStepTrigger, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// CR 603.7c, 400.7: só volta a mesma carta, se ainda estiver no cemitério para onde foi
const VOLTA = defineAbility('Avacyn, Angel of Horror:volta', nextEndStepTrigger(function* (c) {
  const carta = c.data.carta as ObjId;
  const o = c.g.state.objects[carta];
  if (o?.zone !== 'graveyard' || o.isToken) return;
  yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
}, 'No início da próxima etapa final, devolva aquela carta ao campo sob seu controle.'));

export default defineCard({
  name: 'Avacyn, Angel of Horror',
  faces: [{
    abilities: [
      ...keywords('flying', 'deathtouch'),
      // CR 603.10a: olha para trás — Avacyn morrendo junto com outras criaturas dispara para cada uma (ruling 1)
      triggered(on.dies((c, l, o) => l.controller === c.you && (o.id === c.source || !o.isToken)), function* (c) {
        const carta = c.g.state.lki[c.event.old as ObjId]?.newId ?? null;
        const o = carta !== null ? c.g.state.objects[carta] : undefined;
        // ficha deixa de existir no cemitério (CR 111.7); carta que já saiu do cemitério é outro objeto (CR 400.7)
        if (carta === null || !o || o.zone !== 'graveyard' || o.isToken) return;
        // CR 603.7: o gatilho atrasado é criado na resolução; "você" é quem controlava esta habilidade
        delayed(c, VOLTA.id!, { data: { carta } });
      }, { text: 'Sempre que Avacyn ou outra criatura que não seja ficha que você controla morre, devolva aquela carta ao campo sob seu controle no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'teste: ruling 1 — Avacyn e outra criatura morrendo juntas disparam uma vez cada e as duas voltam',
  },
});
