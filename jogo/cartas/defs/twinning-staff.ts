// Twinning Staff
// If you would copy a spell one or more times, instead copy it that many times plus an additional time. You may choose
// new targets for the additional copy.
// {7}, {T}: Copy target instant or sorcery spell you control. You may choose new targets for the copy.
import { activated, copySpell, defineCard, is, staticAbility, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Twinning Staff',
  faces: [{
    abilities: [
      // CR 614.1a: substituição sobre copiar mágicas (não cartas: ruling 5); ruling 4: cada Twinning Staff soma uma
      staticAbility({
        rules: { extraSpellCopies: (c, p) => (p === c.you ? 1 : 0) },
        text: 'Se você fosse copiar uma mágica uma ou mais vezes, em vez disso copie-a essa quantidade de vezes mais uma. Você pode escolher novos alvos para a cópia adicional.',
      }),
      activated('{7}, {T}', function* (c) {
        const id = tgt(c);
        // ruling 7: a cópia não é conjurada e resolve antes da original
        if (id !== null) yield* copySpell(c.g, id, c.you, { newTargets: true });
      }, {
        targets: [t.spell((c, id) => is.instantOrSorcery(c, id) && c.g.state.objects[id]?.stack?.controller === c.you, 'mágica instantânea ou feitiço alvo que você controla')],
        text: '{7}, {T}: Copie a mágica instantânea ou feitiço alvo que você controla. Você pode escolher novos alvos para a cópia.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.10 — a cópia tem o mesmo X (motor/stack.ts copySpell)',
    2: 'regra geral: CR 707.10 — a divisão do dano não muda na cópia (motor/stack.ts copySpell)',
    3: 'regra geral: CR 616.1 — a cópia adicional entra na pilha junto com as outras; aqui, logo depois da cópia que a gerou (motor/stack.ts copySpell)',
    4: 'teste: com dois Twinning Staff, duas cópias adicionais',
    5: 'regra geral: CR 707.10 — só conta copiar uma mágica; copiar uma carta para conjurar não passa por copySpell (cartas/defs/flawless-forgery.ts)',
    6: 'teste: {7}, {T}: copia uma mágica sua na pilha, com ou sem alvos, e a cópia resolve antes',
    7: 'teste: {7}, {T}: copia uma mágica sua na pilha, com ou sem alvos, e a cópia resolve antes',
    8: 'regra geral: CR 707.10c — os alvos da cópia podem ser trocados, todos ou nenhum (motor/stack.ts copySpell)',
    9: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell)',
    10: 'regra geral: CR 707.10c — a cópia adicional sempre pode ter novos alvos (motor/stack.ts copySpell, extra)',
    11: 'regra geral: CR 707.10 — a cópia leva os custos pagos na original (motor/stack.ts copySpell)',
  },
});
