// Leyline Tyrant
// Flying
// You don't lose unspent red mana as steps and phases end.
// When this creature dies, you may pay any amount of {R}. When you do, it deals that much damage to any target.
import { chooseNumber, dealDamage, defineAbility, defineCard, keyword, on, parseCost, payMana, reflexive, staticAbility, t, tgtRef, triggered } from '../../motor/api.ts';
import { canAfford } from '../../motor/costs.ts';

// ruling 4 (CR 603.12): gatilho reflexivo; o alvo é escolhido depois de pagar, e dá para responder antes do dano
const DANO = defineAbility('Leyline Tyrant:dano', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const alvo = tgtRef(c);
  if (alvo) dealDamage(c.g, [{ source: c.source, target: alvo, amount: c.data.n as number, combat: false }]);
}, { targets: [t.any()], text: 'Quando você paga, Leyline Tyrant causa essa quantidade de dano a qualquer alvo.' }));

const vermelhas = (n: number) => parseCost('{R}'.repeat(n));

export default defineCard({
  name: 'Leyline Tyrant',
  faces: [{
    abilities: [
      keyword('flying'),
      // rulings 1-3 (CR 106.4, 500.5): só a mana vermelha fica, com as restrições que tiver, enquanto ele estiver no campo
      staticAbility({ rules: { keepsUnspentMana: (c, p, u) => p === c.you && u.type === 'R' }, text: 'Você não perde mana vermelha não gasta quando as etapas e fases terminam.' }),
      triggered(on.selfDies(), function* (c) {
        // "qualquer quantidade de {R}": até onde a sua mana vermelha (na reserva ou a produzir) alcança
        let max = 0;
        while (max < 99 && canAfford(c.g, c.you, vermelhas(max + 1), { purpose: { kind: 'effect' } })) max++;
        if (max === 0) return;
        const n = yield* chooseNumber(c.g, c.you, 'Leyline Tyrant: quantas manas {R} pagar? (ele causa essa quantidade de dano a qualquer alvo)', 0, max);
        if (n <= 0) return;
        const pago = yield* payMana(c.g, c.you, vermelhas(n), { purpose: { kind: 'effect' }, canCancel: true, label: 'Leyline Tyrant' });
        if (pago === null) return;
        reflexive(c, DANO.id!, { n });
      }, { text: 'Quando esta criatura morre, você pode pagar qualquer quantidade de {R}. Quando fizer isso, ela causa essa quantidade de dano a qualquer alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: a mana vermelha não gasta fica entre etapas, fases e turnos; as outras cores se perdem',
    2: 'regra geral: CR 106.6 — a mana guardada mantém as restrições que tinha (motor/veneno-emblema.ts loseUnspentMana)',
    3: 'teste: depois que ele sai do campo, a mana vermelha se perde no fim da etapa',
    4: 'teste: ao morrer, paga {R}{R}{R} (inclusive com a mana guardada) e causa 3 de dano ao alvo escolhido depois de pagar',
  },
});
