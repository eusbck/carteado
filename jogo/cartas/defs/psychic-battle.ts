// Psychic Battle
// Whenever a player chooses one or more targets, each player reveals the top card of their library. The player who
// reveals the card with the greatest mana value may change the target or targets. If two or more cards are tied for
// greatest, the target or targets remain unchanged. Changing targets this way doesn't trigger abilities of permanents
// named Psychic Battle.
import { changeTargets, defineCard, manaValue, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

const NOME = 'Psychic Battle';

export default defineCard({
  name: NOME,
  faces: [{
    abilities: [
      // um gatilho por mágica ou habilidade para a qual alguém escolheu alvos; a mudança feita por Psychic Battle não
      // dispara as habilidades de permanentes com este nome
      triggered(on.batch((evs) => {
        const por = new Set<ObjId>();
        for (const e of evs) if (e.type === 'target' && e.noTriggerFor !== NOME) por.add(e.by);
        return [...por].map((by) => ({ by }));
      }), function* (c) {
        const s = c.g.state;
        const alvo = c.event.by as ObjId;
        if (s.objects[alvo]?.zone !== 'stack') return;
        // ruling 4: quem está com o grimório vazio não revela nada e não entra na comparação
        const reveladas: { p: PlayerId; id: ObjId; mv: number }[] = [];
        for (const p of c.g.apnap()) {
          const topo = s.zones.library[p][0];
          if (topo !== undefined) reveladas.push({ p, id: topo, mv: manaValue(c.g, topo) });
        }
        if (!reveladas.length) return;
        c.g.log(`Psychic Battle: ${reveladas.map((r) => `${s.players[r.p].name} revela ${nameOf(c.g, r.id)} (${r.mv})`).join('; ')}.`, { rule: '701.20' });
        const maior = Math.max(...reveladas.map((r) => r.mv));
        const vencedores = reveladas.filter((r) => r.mv === maior);
        if (vencedores.length !== 1) { c.g.log('Psychic Battle: empate no maior valor de mana; os alvos não mudam.'); return; }
        const quem = vencedores[0].p;
        // ruling 2: pode mudar todos, alguns ou nenhum; ruling 3: a quantidade não muda e os novos têm de ser legais
        if (!(yield* yesNo(c.g, quem, 'Psychic Battle: você revelou o maior valor de mana. Mudar o alvo ou os alvos?'))) return;
        yield* changeTargets(c.g, alvo, quem, { noTriggerFor: NOME });
      }, { text: 'Sempre que um jogador escolhe um ou mais alvos, cada jogador revela a carta do topo do próprio grimório. O jogador que revelar a carta com o maior valor de mana pode mudar o alvo ou os alvos. Se duas ou mais cartas empatarem no maior valor, o alvo ou os alvos não mudam. Mudar alvos assim não dispara habilidades de permanentes com o nome Psychic Battle.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 709.4b — o valor de mana da carta dividida fora da pilha é a soma das metades (motor/formatos.ts)',
    2: 'teste: quem revela o maior valor de mana pode mudar o alvo, mesmo de uma mágica de outro jogador',
    3: 'regra geral: CR 115.7a — a quantidade de alvos não muda e cada alvo novo precisa ser legal (motor/stack.ts changeTargets)',
    4: 'teste: quem está com o grimório vazio não revela nada e não entra na comparação',
  },
});
