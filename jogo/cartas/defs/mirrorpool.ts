// Mirrorpool
// This land enters tapped.
// {T}: Add {C}.
// {2}{C}, {T}, Sacrifice this land: Copy target instant or sorcery spell you control. You may choose new targets for the copy.
// {4}{C}, {T}, Sacrifice this land: Create a token that's a copy of target creature you control.
import { activated, and, copiableValues, copySpell, createTokens, defineCard, is, land, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Mirrorpool',
  faces: [{
    abilities: [
      land.tapped(),
      mana('C'),
      activated('{2}{C}, {T}, Sacrifice this land', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* copySpell(c.g, id, c.you, { newTargets: true });
      }, { targets: [t.spell(and(is.instantOrSorcery, is.yours), 'mágica instantânea ou de feitiço alvo que você controla')], text: '{2}{C}, {T}, Sacrifique este terreno: Copie a mágica instantânea ou de feitiço alvo que você controla. Você pode escolher novos alvos para a cópia.' }),
      activated('{4}{C}, {T}, Sacrifice this land', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: '{4}{C}, {T}, Sacrifique este terreno: Crie uma ficha que é uma cópia da criatura alvo que você controla.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — a cópia da mágica não é conjurada',
    2: 'regra geral: CR 707.2 — a ficha copia os valores copiáveis (sem marcadores nem efeitos)',
    3: 'regra geral: CR 106.1b — {C} exige mana incolor, não genérica',
  },
});
