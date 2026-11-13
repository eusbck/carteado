// Mirrorpool
// This land enters tapped.
// {T}: Add {C}.
// {2}{C}, {T}, Sacrifice this land: Copy target instant or sorcery spell you control. You may choose new targets for the
// copy.
// {4}{C}, {T}, Sacrifice this land: Create a token that's a copy of target creature you control.
import { activated, copiableValues, copySpell, createTokens, defineCard, is, land, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Mirrorpool',
  faces: [{
    abilities: [
      land.tapped(),
      mana('C', { text: '{T}: Adicione {C}.' }),
      // rulings 1-6: qualquer instantânea ou feitiço seu (com ou sem alvos); a cópia não é conjurada (motor/stack.ts copySpell)
      activated('{2}{C}, {T}, Sacrifice this land', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* copySpell(c.g, id, c.you, { newTargets: true });
      }, {
        targets: [t.spell((c, id) => is.instantOrSorcery(c, id) && c.g.state.objects[id]?.stack?.controller === c.you, 'mágica instantânea ou de feitiço alvo que você controla')],
        text: '{2}{C}, {T}, Sacrifique este terreno: Copie a mágica instantânea ou de feitiço alvo que você controla. Você pode escolher novos alvos para a cópia.',
      }),
      // rulings 7-11: copia os valores copiáveis (CR 707.2), X = 0, e os gatilhos e substituições de entrar valem
      activated('{4}{C}, {T}, Sacrifice this land', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
      }, {
        targets: [t.creature((c, id) => is.yours(c, id), 'criatura alvo que você controla')],
        text: '{4}{C}, {T}, Sacrifique este terreno: Crie uma ficha que é uma cópia da criatura alvo que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: copia uma instantânea ou feitiço que você controla',
    2: 'regra geral: CR 707.10 — a cópia é criada na pilha, não conjurada (motor/stack.ts copySpell)',
    3: 'regra geral: CR 707.10c — pode mudar os alvos da cópia (motor/stack.ts copySpell)',
    4: 'regra geral: CR 707.10 — a cópia tem os mesmos modos',
    5: 'regra geral: CR 707.10 — a cópia tem o mesmo X',
    6: 'regra geral: CR 707.10 — custos adicionais pagos valem para a cópia',
    7: 'teste: a ficha copia a criatura impressa, sem marcadores',
    8: 'regra geral: CR 707.2 — só os valores copiáveis (motor/chars.ts copiableValues)',
    9: 'regra geral: CR 107.3 — X de uma cópia de permanente vale 0 (motor/chars.ts copiableValues)',
    10: 'regra geral: CR 707.3 — copiando uma cópia, a ficha entra como o que a criatura copiava (motor/mecanicas.ts copiableValues)',
    11: 'regra geral: CR 707.5 — gatilhos e substituições de entrar da cópia funcionam (motor/actions.ts putOntoBattlefield)',
  },
});
