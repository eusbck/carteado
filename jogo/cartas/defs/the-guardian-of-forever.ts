// The Guardian of Forever
// Defender
// {4}, Sacrifice another nontoken creature: Return that card to the battlefield under its owner's control at the
// beginning of the next end step.
import { activated, defineCard, delayed, isCreature, keyword } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { VOLTA_NA_ETAPA_FINAL } from '../startrek.ts';

export default defineCard({
  name: 'The Guardian of Forever',
  faces: [{
    abilities: [
      keyword('defender'),
      // o analisador de custos não entende "nontoken": a parte do sacrifício vai montada à mão
      activated([
        { k: 'mana', cost: '{4}' },
        { k: 'sacrifice', n: 1, label: 'outra criatura que não é ficha', filter: (c, id) => id !== c.source && isCreature(c.g, id) && !c.g.state.objects[id]?.isToken },
      ], function* (c) {
        const antigos = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? []);
        // CR 400.7: a carta no cemitério é um objeto novo; se ela sair do cemitério antes, não volta
        const cartas = antigos.map((id) => c.g.state.lki[id]?.newId).filter((id): id is ObjId => typeof id === 'number' && c.g.state.objects[id]?.zone === 'graveyard');
        if (cartas.length) delayed(c, VOLTA_NA_ETAPA_FINAL.id!, { data: { cartas, zona: 'graveyard' } });
      }, { text: '{4}, Sacrifique outra criatura que não é ficha: Devolva essa carta ao campo sob o controle do dono no início da próxima etapa final.' }),
    ],
  }],
  rulings: {},
});
