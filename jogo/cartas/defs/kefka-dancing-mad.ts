// Kefka, Dancing Mad
// During your turn, Kefka has indestructible.
// At the beginning of your end step, exile a card at random from each opponent's graveyard. You may cast any number of
// spells from among cards exiled this way without paying their mana costs. Then each player who owns a spell you cast
// this way loses life equal to its mana value.
import { chooseItems, defineCard, exile, isLand, loseLife, manaValue, mayCastFree, nameOf, on, staticAbility, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Kefka, Dancing Mad',
  faces: [{
    abilities: [
      staticAbility({
        affects: (c, o) => o.id === c.source && c.g.state.turn.active === c.you,
        mods: () => [{ k: 'addKeyword', kw: 'indestructible' }],
        text: 'Durante o seu turno, Kefka tem indestrutível.',
      }),
      triggered(on.endStep('you'), function* (c) {
        const s = c.g.state;
        const exiladas: ObjId[] = [];
        for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) {
          const cem = s.zones.graveyard[p];
          if (!cem.length) continue;
          const [sorteada] = shuffle(s.rng, [...cem]);
          const [ex] = yield* exile(c.g, [sorteada]);
          if (ex !== null && ex !== undefined) exiladas.push(ex);
        }
        // rulings 1-5: conjura durante a resolução, uma por vez, sem pagar (X = 0), ignorando o tempo
        const perdas: { dono: PlayerId; mv: number }[] = [];
        for (;;) {
          const cands = exiladas.filter((id) => s.objects[id]?.zone === 'exile' && !isLand(c.g, id));
          if (!cands.length) break;
          const [esc] = yield* chooseItems(c.g, c.you, 'Kefka: escolha a próxima mágica para conjurar sem pagar (ou pare)', [{ id: '', label: 'Parar' }, ...cands.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } }))], 1, 1);
          if (!esc) break;
          const id = Number(esc);
          const dono = s.objects[id].owner;
          const mv = manaValue(c.g, id);
          if (yield* mayCastFree(c.g, c.you, id, `Conjurar ${nameOf(c.g, id)} sem pagar o custo de mana?`)) perdas.push({ dono, mv });
          else exiladas.splice(exiladas.indexOf(id), 1);
        }
        for (const p of perdas) if (p.mv > 0) loseLife(c.g, p.dono, p.mv, c.source);
      }, { text: 'No início da sua etapa final, exile uma carta aleatória do cemitério de cada oponente. Você pode conjurar quantas mágicas quiser dentre elas sem pagar o custo de mana. Depois, cada jogador dono de uma mágica conjurada assim perde vida igual ao valor de mana dela.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2g — conjura durante a resolução, ignorando o tempo',
    2: 'teste: as não conjuradas ficam no exílio',
    3: 'regra geral: CR 107.3b — X vale 0',
    4: 'regra geral: CR 608.2g — uma de cada vez; a última resolve primeiro',
    5: 'regra geral: CR 118.9a — sem custo alternativo; custos adicionais podem ser pagos',
  },
});
