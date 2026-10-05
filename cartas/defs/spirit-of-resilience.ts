// Spirit of Resilience
// Whenever one or more cards leave your graveyard, put a +1/+1 counter on this creature, then you may have this creature
// become a copy of an artifact or creature card from among those cards until end of turn.
import { addCounters, chooseItems, defineCard, on, printedChars, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { GameEvent } from '../../motor/events.ts';

export default defineCard({
  name: 'Spirit of Resilience',
  faces: [{
    abilities: [
      // ruling 2: um gatilho por evento
      triggered(on.batch((evs, c) => {
        const cartas = evs.filter((e): e is Extract<GameEvent, { type: 'zone' }> => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you);
        // guarda o nome de cada carta (ruling 4: copia o que está impresso)
        return cartas.length ? { cartas: cartas.map((e) => c.g.state.objects[e.obj]?.def ?? c.g.state.lki[e.old]?.obj.def).filter((d): d is string => !!d) } : false;
      }), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        const nomes = [...new Set((c.event.cartas as string[]).filter((d) => {
          const pc = printedChars(d, 0, c.you);
          return pc.types.includes('Artifact') || pc.types.includes('Creature');
        }))];
        if (!nomes.length) return;
        const itens = [{ id: '', label: 'Não copiar' }, ...nomes.map((d) => ({ id: d, label: `Virar uma cópia de ${d}`, card: { def: d } }))];
        const [d] = yield* chooseItems(c.g, c.you, 'Spirit of Resilience: virar cópia de uma carta até o fim do turno?', itens, 1, 1);
        // rulings 1, 3: não entra nem sai do campo; X vale 0
        if (d) untilEndOfTurn(c, [c.source], [{ k: 'copy', of: { def: d, face: 0 } }]);
      }, { text: 'Sempre que uma ou mais cartas saem do seu cemitério, coloque um marcador +1/+1 nesta criatura; depois, você pode fazê-la virar uma cópia de uma carta de artefato ou criatura dentre essas cartas até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: virar cópia não dispara "ao entrar"',
    2: 'regra geral: o gatilho é por lote de cartas',
    3: 'regra geral: CR 707.9 — X vale 0',
    4: 'regra geral: CR 707.2 — copia a carta impressa',
  },
});
