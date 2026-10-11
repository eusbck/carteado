// Maestros Charm
// Choose one —
// • Look at the top five cards of your library. Put one of those cards into your hand and the rest into your graveyard.
// • Each opponent loses 3 life and you gain 3 life.
// • Maestros Charm deals 5 damage to target creature or planeswalker.
import { chooseItems, dealDamage, defineCard, gainLife, loseLife, modal, moveObjects, nameOf, objItem, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Maestros Charm',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Olhe as cinco cartas do topo do seu grimório. Ponha uma delas na sua mão e o resto no seu cemitério',
          *effect(c) {
            const s = c.g.state;
            const topo = s.zones.library[c.you].slice(0, 5);
            if (!topo.length) return;
            const [esc] = topo.length === 1 ? [String(topo[0])] : yield* chooseItems(c.g, c.you, 'Maestros Charm: escolha a carta que vai para a sua mão (as outras vão para o cemitério)', topo.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: s.objects[id].def } })), 1, 1);
            const paraMao = Number(esc);
            yield* moveObjects(c.g, [{ id: paraMao, to: 'hand' }], 'effect');
            const resto = topo.filter((id) => id !== paraMao && s.objects[id]?.zone === 'library');
            if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'graveyard' as const })), 'effect');
          },
        },
        {
          text: 'Cada oponente perde 3 de vida e você ganha 3 de vida',
          *effect(c) {
            for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 3, c.source);
            gainLife(c.g, c.you, 3, c.source);
          },
        },
        {
          text: 'Maestros Charm causa 5 de dano à criatura ou planeswalker alvo',
          targets: [t.creatureOrPlaneswalker()],
          *effect(c) {
            const id = tgt(c);
            if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 5, combat: false }]);
          },
        },
      ]),
    },
  }],
  rulings: {},
});
