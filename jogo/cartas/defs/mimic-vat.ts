// Mimic Vat
// Imprint — Whenever a nontoken creature dies, you may exile that card. If you do, return each other card exiled with
// this artifact to its owner's graveyard.
// {3}, {T}: Create a token that's a copy of a card exiled with this artifact. It gains haste. Exile it at the beginning
// of the next end step.
import { activated, chooseItems, copiableValues, createTokens, defineAbility, defineCard, delayed, exile, linkedExiled, moveObjects, nameOf, nextEndStepTrigger, on, triggered, withDuration, yesNo } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// rulings 10-11: exilada no início da próxima etapa final, esteja com quem estiver e exista ou não o Mimic Vat
const EXILA = defineAbility('Mimic Vat:exila', nextEndStepTrigger(function* (c) {
  const id = c.data.ficha as ObjId;
  if (c.g.state.objects[id]?.zone === 'battlefield') yield* exile(c.g, [id]);
}, 'Exile a ficha criada por Mimic Vat.'));

export default defineCard({
  name: 'Mimic Vat',
  faces: [{
    abilities: [
      // imprimir é palavra de habilidade (CR 207.2c); as duas habilidades são vinculadas (CR 607.2a). Ruling 8: criatura de qualquer jogador
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.to !== 'graveyard' || e.token) return false;
        return c.g.state.lki[e.old]?.chars.types.includes('Creature') ? { carta: e.obj } : false;
      }), function* (c) {
        const g = c.g;
        const carta = c.event.carta as ObjId;
        const vat = g.state.objects[c.source];
        // ruling 14: opcional; se a carta já saiu do cemitério ou o Vat saiu do campo, nada acontece
        if (!vat || vat.zone !== 'battlefield' || g.state.objects[carta]?.zone !== 'graveyard') return;
        if (!(yield* yesNo(g, c.you, `Mimic Vat: exilar ${nameOf(g, carta)}? (as outras cartas exiladas com ele voltam para o cemitério dos donos)`))) return;
        const antigas = linkedExiled(g, c.source, 'imprint');
        const [nova] = yield* exile(g, [carta], { linkTo: { obj: c.source, key: 'imprint' } });
        if (nova === null || nova === undefined) return;
        const voltar = antigas.filter((id) => id !== nova && g.state.objects[id]?.zone === 'exile');
        if (voltar.length) yield* moveObjects(g, voltar.map((id) => ({ id, to: 'graveyard' as const })), 'effect');
        const agora = g.state.objects[c.source];
        if (agora) { agora.linked.imprint = [nova]; g.bump(); }
      }, { text: 'Imprimir — Sempre que uma criatura que não é ficha morre, você pode exilar essa carta. Se fizer isso, devolva cada outra carta exilada com este artefato para o cemitério do dono.' }),
      activated('{3}, {T}', function* (c) {
        const g = c.g;
        // rulings 5 e 7: vale a carta que estiver exilada com o Vat na resolução; sem carta, nada é criado
        const cartas = linkedExiled(g, c.source, 'imprint');
        if (!cartas.length) return;
        const [esc] = cartas.length === 1 ? [String(cartas[0])] : yield* chooseItems(g, c.you, 'Mimic Vat: escolha a carta exilada para copiar', cartas.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })), 1, 1);
        const [ficha] = yield* createTokens(g, c.you, { copyOf: copiableValues(g, Number(esc)) }, 1);
        if (ficha === undefined) return;
        // ruling 12: o ímpeto não tem prazo
        withDuration(c, [ficha], [{ k: 'addKeyword', kw: 'haste' }], { kind: 'whileOnBattlefield', obj: ficha });
        delayed(c, EXILA.id!, { data: { ficha } });
      }, { text: '{3}, {T}: Crie uma ficha que é uma cópia de uma carta exilada com este artefato. Ela ganha ímpeto. Exile-a no início da próxima etapa final.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 111.1 — uma carta que não é de permanente pode ficar exilada com o Vat, mas não vira ficha (motor/actions.ts putOntoBattlefield)',
    2: 'não se aplica: não há cartas de meld nos decks',
    3: 'regra geral: CR 603.3b — várias criaturas morrendo juntas disparam uma vez cada, na ordem que você escolher (motor/triggers.ts)',
    4: 'regra geral: CR 603.10a — vale o que era criatura no campo, mesmo que a carta não seja de criatura (motor/triggers.ts, última informação)',
    5: 'teste: imprimindo outra carta, a anterior volta para o cemitério do dono e a ficha copia a nova',
    6: 'regra geral: CR 702.10 — o ímpeto é dado à ficha, seja ela criatura ou não (cartas/defs/mimic-vat.ts)',
    7: 'teste: sem carta exilada, a habilidade não cria nada',
    8: 'teste: criatura de um oponente que morre também pode ser exilada; a ficha tem ímpeto e é exilada na etapa final',
    9: 'regra geral: CR 603.6a — as habilidades de entrar da carta copiada disparam para a ficha (cartas/defs/clone-legion.test.ts)',
    10: 'teste: criatura de um oponente que morre também pode ser exilada; a ficha tem ímpeto e é exilada na etapa final',
    11: 'regra geral: CR 513.2 — ativada na etapa final, a ficha é exilada na etapa final do turno seguinte (motor/efeitos.ts nextEndStepTrigger)',
    12: 'regra geral: CR 603.7 — se o gatilho atrasado não resolver, a ficha fica com ímpeto (o efeito não tem prazo)',
    13: 'regra geral: CR 107.3 — X de uma cópia de permanente vale 0 (motor/chars.ts)',
    14: 'teste: é opcional, e fichas que morrem não disparam',
  },
});
