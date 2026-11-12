// Kambal, Profiteering Mayor
// Whenever one or more tokens your opponents control enter, for each of them, create a tapped token that's a copy of it.
// This ability triggers only once each turn.
// Whenever one or more tokens you control enter, each opponent loses 1 life and you gain 1 life.
import { controllerOf, copiableValues, defineCard, gainLife, loseLife, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Kambal, Profiteering Mayor',
  faces: [{
    abilities: [
      triggered(on.batch((evs, c) => {
        const ids = evs.flatMap((e) => (e.type === 'zone' && e.to === 'battlefield' && c.g.state.objects[e.obj]?.isToken && c.g.isOpponent(c.you, controllerOf(c.g, e.obj)) ? [e.obj] : []));
        return ids.length ? { fichas: ids } : false;
      }), function* (c) {
        // rulings 1-3: cada cópia usa os valores copiáveis da ficha (CR 707.2), mesmo que ela já tenha saído do campo
        // todas criadas ao mesmo tempo (um evento só: o outro gatilho do Kambal dispara uma vez)
        const ids = c.event.fichas as ObjId[];
        yield* putOntoBattlefield(c.g, ids.map((id) => ({ controller: c.you, token: { copyOf: copiableValues(c.g, id) }, tapped: true })), 'token');
      }, { oncePerTurn: true, text: 'Sempre que uma ou mais fichas que seus oponentes controlam entram, para cada uma delas, crie uma ficha virada que é uma cópia dela. Esta habilidade só dispara uma vez por turno.' }),
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.to === 'battlefield' && c.g.state.objects[e.obj]?.isToken && controllerOf(c.g, e.obj) === c.you)), function* (c) {
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma ou mais fichas que você controla entram, cada oponente perde 1 ponto de vida e você ganha 1 ponto de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: copia as fichas do oponente viradas, sem os marcadores; só uma vez por turno',
    2: 'regra geral: CR 107.3m — X no custo de mana de uma cópia vale 0',
    3: 'regra geral: CR 707.3 — a cópia de uma ficha que copia outra coisa copia o que ela copia (motor/mecanicas.ts copiableValues)',
    4: 'regra geral: CR 603.6a, 614.12 — gatilhos e "entra com" da ficha copiada valem (motor/actions.ts putOntoBattlefield)',
  },
});
