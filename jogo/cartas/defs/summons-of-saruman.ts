// Summons of Saruman
// Amass Orcs X. Mill X cards. You may cast an instant or sorcery spell with mana value X or less from among them without
// paying its mana cost. (To amass Orcs X, put X +1/+1 counters on an Army you control. It's also an Orc. If you don't
// control an Army, create a 0/0 black Orc Army creature token first.)
// Flashback—{3}{U}{R}, Exile X cards from your graveyard.
import { amass, chooseItems, defineCard, exile, flashback, is, manaValue, mayCastFree, mill, nameOf, objItem } from '../../motor/api.ts';
import { REUNIR } from '../mordor.ts';

export default defineCard({
  name: 'Summons of Saruman',
  faces: [{
    altCosts: [flashback('{3}{U}{R}')],
    spell: {
      *effect(c) {
        const s = c.g.state;
        let x = c.x;
        // retrospectiva: X é o número de cartas exiladas do seu cemitério. O motor pergunta quais na resolução, e não
        // ao conjurar (a própria Summons of Saruman está na pilha e não conta)
        if (c.method === 'flashback') {
          const cem = [...s.zones.graveyard[c.you]];
          const esc = cem.length ? yield* chooseItems(c.g, c.you, 'Summons of Saruman: exile X cartas do seu cemitério (o número escolhido é o X)', cem.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, cem.length) : [];
          const foram = esc.length ? (yield* exile(c.g, esc.map(Number))).filter((y) => y !== null) : [];
          x = foram.length;
        }
        if (x > 0) yield* amass(c.g, c.you, 'Orc', x);
        const moidas = x > 0 ? yield* mill(c.g, c.you, x) : [];
        // rulings 1-3: conjurada agora, sem pagar o custo de mana (X = 0, sem custos alternativos); é opcional
        const opcoes = moidas.filter((id) => s.objects[id]?.zone === 'graveyard' && is.instantOrSorcery({ g: c.g, you: c.you, source: c.source }, id) && manaValue(c.g, id) <= x);
        if (!opcoes.length) return;
        const [qual] = yield* chooseItems(c.g, c.you, `Summons of Saruman: conjurar uma instantânea ou feitiço de valor de mana ${x} ou menos entre as cartas moídas?`, [{ id: '', label: 'Não conjurar' }, ...opcoes.map((id) => objItem(c.g, id, nameOf(c.g, id)))], 1, 1);
        if (qual) yield* mayCastFree(c.g, c.you, Number(qual), `Conjurar ${nameOf(c.g, Number(qual))} sem pagar o custo de mana?`);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2g — conjurada durante a resolução, sem as permissões de tempo do tipo (motor/mecanicas.ts mayCastFree)',
    2: 'regra geral: CR 118.9 — sem pagar o custo de mana não se combinam custos alternativos; os adicionais continuam (motor/stack.ts)',
    3: 'regra geral: CR 107.3b — X é 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    4: REUNIR.escrita,
    5: REUNIR.como,
    6: REUNIR.zumbis,
    7: REUNIR.varios,
    8: REUNIR.entra00,
    9: REUNIR.alvos,
    10: REUNIR.reunido,
  },
});
