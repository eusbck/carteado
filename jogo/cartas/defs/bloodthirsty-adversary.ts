// Bloodthirsty Adversary
// Haste
// When this creature enters, you may pay {2}{R} any number of times. When you pay this cost one or more times, put that
// many +1/+1 counters on this creature, then exile up to that many target instant and/or sorcery cards with mana value
// 3 or less from your graveyard and copy them. You may cast any number of the copies without paying their mana costs.
import {
  addCounters, and, chooseNumber, defineAbility, defineCard, etb, exile, is, keyword, payMana, reflexive, t, tgtsAll, triggered,
} from '../../motor/api.ts';
import { canAfford } from '../../motor/costs.ts';
import type { ManaSymbol, ObjId } from '../../motor/types.ts';
import { conjuraCopiasGratis } from '../saque.ts';

/** {2}{R} pago n vezes */
const custo = (n: number): ManaSymbol[] => [{ k: 'generic', n: 2 * n }, ...Array.from({ length: n }, () => ({ k: 'color', c: 'R' }) as ManaSymbol)];

// CR 603.12: gatilho reflexivo; o número de vezes pago vem no evento e limita os alvos (ruling 3)
const REFLEXO = defineAbility('Bloodthirsty Adversary:reflexo', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const n = Number(c.event.vezes ?? 0);
  if (n > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', n, c.you);
  const alvos = tgtsAll(c, 0);
  if (!alvos.length) return;
  // ruling 1: as cartas continuam exiladas, conjurando as cópias ou não
  const exiladas = (yield* exile(c.g, alvos)).filter((id): id is ObjId => id !== null && id !== undefined && c.g.state.objects[id]?.zone === 'exile');
  // ruling 2: as cópias são conjuradas agora, durante a resolução
  yield* conjuraCopiasGratis(c, exiladas, 'Bloodthirsty Adversary');
}, {
  targets: [{
    ...t.card('graveyard', and(is.instantOrSorcery, is.mvAtMost(3)), 'carta de instantânea ou de feitiço alvo com valor de mana 3 ou menos no seu cemitério'),
    min: 0, max: (c) => Number((c as { event?: { vezes?: number } }).event?.vezes ?? 0),
  }],
  text: 'Quando você paga esse custo uma ou mais vezes, coloque essa quantidade de marcadores +1/+1 nesta criatura e depois exile até essa quantidade de cartas de instantânea e/ou de feitiço alvo com valor de mana 3 ou menos do seu cemitério e copie-as. Você pode conjurar quantas cópias quiser sem pagar os custos de mana delas.',
}));

export default defineCard({
  name: 'Bloodthirsty Adversary',
  faces: [{
    abilities: [
      keyword('haste'),
      etb(function* (c) {
        let max = 0;
        while (max < 20 && canAfford(c.g, c.you, custo(max + 1), { purpose: { kind: 'effect' } })) max++;
        if (max === 0) return;
        const n = yield* chooseNumber(c.g, c.you, 'Bloodthirsty Adversary: quantas vezes você paga {2}{R}?', 0, max);
        if (n <= 0) return;
        const pago = yield* payMana(c.g, c.you, custo(n), { purpose: { kind: 'effect' }, canCancel: true, label: `pagar {2}{R} ${n} vez(es)` });
        if (pago === null) return;
        reflexive(c, REFLEXO.id!, {}, { vezes: n });
      }, { text: 'Quando esta criatura entra, você pode pagar {2}{R} qualquer número de vezes.' }),
    ],
  }],
  rulings: {
    1: 'teste: pagando duas vezes, ganha dois marcadores e conjura cópias das duas cartas exiladas',
    2: 'teste: pagando duas vezes, ganha dois marcadores e conjura cópias das duas cartas exiladas',
    3: 'teste: pagando duas vezes, ganha dois marcadores e conjura cópias das duas cartas exiladas',
  },
});
