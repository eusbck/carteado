// Twilight Diviner
// When this creature enters, surveil 2.
// Whenever one or more other creatures you control enter, if they entered or were cast from a graveyard, create a token
// that's a copy of one of them. This ability triggers only once each turn.
import { chooseItems, copiableValues, createTokens, defineCard, etb, isCreature, lookAndArrange, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import type { GameEvent } from '../../motor/events.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Twilight Diviner',
  faces: [{
    abilities: [
      etb(function* (c) { yield* lookAndArrange(c.g, c.you, 2, 'surveil'); }, { text: 'Quando esta criatura entra, vigie 2.' }),
      triggered(on.batch((evs, c) => {
        const s = c.g.state;
        const ids = evs.filter((e): e is Extract<GameEvent, { type: 'zone' }> => e.type === 'zone' && e.to === 'battlefield' && e.obj !== c.source && e.controller === c.you)
          .filter((e) => {
            const o = s.objects[e.obj];
            if (!o || !isCreature(c.g, e.obj)) return false;
            // veio do cemitério, ou foi conjurada do cemitério
            return e.from === 'graveyard' || (e.from === 'stack' && (o.data.spell as { castFrom?: string } | undefined)?.castFrom === 'graveyard');
          }).map((e) => e.obj);
        return ids.length ? { criaturas: ids } : false;
      }), function* (c) {
        const ids = (c.event.criaturas as ObjId[]).filter((id) => c.g.state.objects[id] || c.g.state.lki[id]);
        if (!ids.length) return;
        const [id] = ids.length === 1 ? [String(ids[0])] : yield* chooseItems(c.g, c.you, 'Twilight Diviner: escolha a criatura a copiar', ids.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
        // rulings 1-4: valores copiáveis; habilidades de entrar funcionam; X vale 0
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, Number(id)) }, 1);
      }, { oncePerTurn: true, text: 'Sempre que uma ou mais outras criaturas que você controla entram, se entraram ou foram conjuradas de um cemitério, crie uma ficha que é cópia de uma delas. Esta habilidade dispara só uma vez por turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
    2: 'regra geral: CR 707.5 — habilidades de entrar da cópia funcionam',
    3: 'regra geral: CR 707.3 — copia o que a criatura estiver copiando',
    4: 'regra geral: CR 707.9 — X vale 0',
  },
});
