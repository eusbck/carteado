// Jhoira, Weatherlight Corsair
// Whenever Jhoira enters or attacks, target opponent reveals cards from the top of their library until they reveal a
// historic permanent card. You put that card onto the battlefield under your control and lose life equal to that
// permanent's mana value. That player puts the rest of the revealed cards on the bottom of their library in a random
// order. (Artifacts, legendaries, and Sagas are historic.)
import { chars, defineCard, isPermanentCard, loseLife, nameOf, on, putOntoBattlefield, t, tgtPlayer, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

/** CR 700.6: histórico = lendário, artefato ou Saga; aqui, carta de permanente */
function historica(g: G, id: ObjId): boolean {
  const ch = chars(g, id);
  return isPermanentCard(g, id) && (ch.supertypes.includes('Legendary') || ch.types.includes('Artifact') || ch.subtypes.includes('Saga'));
}

export default defineCard({
  name: 'Jhoira, Weatherlight Corsair',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        const op = tgtPlayer(c);
        if (op === null) return;
        const s = c.g.state;
        const lib = s.zones.library[op];
        const i = lib.findIndex((id) => historica(c.g, id));
        const reveladas = i < 0 ? [...lib] : lib.slice(0, i + 1);
        c.g.log(`${s.players[op].name} revela ${reveladas.map((id) => nameOf(c.g, id)).join(', ') || 'nada'}.`, { rule: '701.20' });
        if (i >= 0) {
          // o dono continua sendo o oponente (CR 108.3); quem controla é você
          const [novo] = yield* putOntoBattlefield(c.g, [{ id: lib[i], controller: c.you }], 'effect');
          // valor de mana do permanente que entrou (CR 202.3); se não entrou, não há perda de vida
          if (novo !== undefined) loseLife(c.g, c.you, chars(c.g, novo).manaValue, c.source);
        }
        // as que sobraram no grimório vão para o fundo em ordem aleatória
        const resto = shuffle(s.rng, reveladas.filter((id) => s.objects[id]?.zone === 'library'));
        s.zones.library[op] = [...s.zones.library[op].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      }, {
        targets: [t.opponent()],
        text: 'Sempre que Jhoira entra ou ataca, o oponente alvo revela cartas do topo do grimório dele até revelar uma carta de permanente histórica. Você põe essa carta no campo sob seu controle e perde uma quantidade de vida igual ao valor de mana desse permanente. Aquele jogador põe o resto das cartas reveladas no fundo do grimório dele em ordem aleatória. (Artefatos, lendários e Sagas são históricos.)',
      }),
    ],
  }],
  rulings: {},
});
