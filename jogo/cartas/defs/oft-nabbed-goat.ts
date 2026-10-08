// Oft-Nabbed Goat
// {1}: Draw a card. Gain control of this creature and put a -1/-1 counter on it. Only your opponents may activate this
// ability and only as a sorcery.
// When this creature dies, if it had one or more -1/-1 counters on it, its owner draws that many cards and each other
// player loses that much life.
import { activated, addCounters, defineCard, draw, gainControl, loseLife, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

const marcadores = (c: { g: { state: { lki: Record<number, { obj: { counters: Record<string, number> } }> } }; event: Record<string, unknown> }): number => c.g.state.lki[c.event.old as ObjId]?.obj.counters['-1/-1'] ?? 0;

export default defineCard({
  name: 'Oft-Nabbed Goat',
  faces: [{
    abilities: [
      // ruling 1: só oponentes do controlador atual
      activated('{1}', function* (c) {
        yield* draw(c.g, c.you, 1);
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        gainControl(c.g, c.source, c.you, { kind: 'permanent' }, c.source);
        addCounters(c.g, { kind: 'obj', id: c.source }, '-1/-1', 1, c.you);
      }, { activator: 'opponents', timing: 'sorcery', text: '{1}: Compre uma carta. Ganhe o controle desta criatura e coloque um marcador -1/-1 nela. Só seus oponentes podem ativar esta habilidade, e só como feitiço.' }),
      triggered(on.selfDies(), function* (c) {
        const n = marcadores(c);
        const dono = c.g.state.lki[c.event.old as ObjId]?.obj.owner ?? c.you;
        yield* draw(c.g, dono, n);
        for (const p of c.g.apnap()) if (p !== dono) loseLife(c.g, p, n, c.source);
      }, {
        condition: (c) => marcadores(c) > 0,
        text: 'Quando esta criatura morre, se tinha um ou mais marcadores -1/-1, o dono dela compra essa quantidade de cartas e cada outro jogador perde essa quantidade de vida.',
      }),
    ],
  }],
  rulings: { 1: 'teste: só os oponentes do controlador podem ativar' },
});
