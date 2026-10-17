// Mob Verdict
// Secret council — Each player secretly votes for another player, then those votes are revealed. For each vote an
// opponent received, Mob Verdict deals 2 damage to that player and each creature that player controls. For each vote
// you received, draw a card.
import { chooseItems, controlledBy, dealDamage, defineCard, draw, isCreature, playerItem } from '../../motor/api.ts';
import type { DamageReq } from '../../motor/actions.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Mob Verdict',
  faces: [{
    spell: {
      *effect(c) {
        const jogadores = c.g.apnap().filter((p) => !c.g.state.players[p].left);
        // rulings 1, 2 e 4: cada um vota num outro jogador, sem ver os votos dos outros; todos são revelados juntos
        const votos = new Map<PlayerId, number>();
        const quem: string[] = [];
        for (const p of jogadores) {
          const outros = jogadores.filter((x) => x !== p);
          if (!outros.length) continue;
          const [v] = yield* chooseItems(c.g, p, 'Mob Verdict: vote em segredo em outro jogador', outros.map((x) => playerItem(c.g, x)), 1, 1, false, { secret: true });
          const alvo = Number(v.slice(1));
          votos.set(alvo, (votos.get(alvo) ?? 0) + 1);
          quem.push(`${c.g.state.players[p].name} → ${c.g.state.players[alvo].name}`);
        }
        c.g.log(`Mob Verdict, votos: ${quem.join('; ')}.`);
        // 2 de dano por voto a cada oponente votado e a cada criatura dele, tudo de uma vez: um oponente com dois votos
        // recebe 4 de dano num evento só, não duas vezes 2 (CR 120.4: dano causado ao mesmo tempo é um evento)
        const reqs: DamageReq[] = [];
        for (const p of jogadores.filter((x) => c.g.isOpponent(c.you, x))) {
          const n = 2 * (votos.get(p) ?? 0);
          if (n <= 0) continue;
          const alvos = [{ kind: 'player' as const, id: p }, ...controlledBy(c.g, p, (id) => isCreature(c.g, id)).map((id) => ({ kind: 'obj' as const, id }))];
          reqs.push(...alvos.map((target) => ({ source: c.source, target, amount: n, combat: false })));
        }
        if (reqs.length) dealDamage(c.g, reqs);
        const meus = votos.get(c.you) ?? 0;
        if (meus > 0) yield* draw(c.g, c.you, meus);
      },
    },
  }],
  rulings: {
    1: 'teste: cada jogador vota em outro; oponente com dois votos recebe 4 de dano, e as criaturas dele também; você compra uma carta por voto seu',
    2: 'regra geral: os votos são escolhas na resolução, cada uma vista só por quem vota até o registro mostrar todas',
    3: 'regra geral: CR 701.38d — gatilhos de "terminar de votar" esperam a mágica acabar de resolver',
    4: 'teste: cada jogador vota em outro; oponente com dois votos recebe 4 de dano, e as criaturas dele também; você compra uma carta por voto seu',
    5: 'regra geral: CR 608.2 — os votos acontecem na resolução',
  },
});
