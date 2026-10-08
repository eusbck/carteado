// Reunion of the House
// Return any number of target creature cards with total power 10 or less from your graveyard to the battlefield. Exile
// Reunion of the House.
import { chars, defineCard, exile, is, putOntoBattlefield, t } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Reunion of the House',
  faces: [{
    spell: {
      targets: [{
        ...t.card('graveyard', is.creature, 'cartas de criatura alvo com força total 10 ou menos'), min: 0, max: 99,
        // rulings 1-3: força das cartas no cemitério; se a soma passar de 10, o conjunto inteiro fica ilegal
        validateSet: (c, alvos) => alvos.reduce((s, r) => s + Math.max(0, (r.kind === 'obj' && c.g.state.objects[r.id] ? chars(c.g, r.id).power ?? 0 : 0)), 0) <= 10,
      }],
      *effect(c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'graveyard' ? [r.id as ObjId] : []));
        const soma = ids.reduce((s, id) => s + Math.max(0, chars(c.g, id).power ?? 0), 0);
        if (soma > 10) return; // ruling 2
        if (ids.length) yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you })), 'effect');
        if (c.g.state.objects[c.source]?.zone === 'stack' && !c.g.state.objects[c.source].isCopy) yield* exile(c.g, [c.source]);
      },
    },
  }],
  rulings: {
    1: 'teste: criaturas com força 0 não pesam na soma',
    2: 'regra geral: CR 608.2b — se a soma passar de 10 na resolução, nada acontece',
    3: 'regra geral: a força é a da carta no cemitério',
  },
});
