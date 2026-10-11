// Anhelo, the Painter
// Deathtouch
// The first instant or sorcery spell you cast each turn has casualty 2. (As you cast that spell, you may sacrifice a
// creature with power 2 or greater. When you do, copy the spell and you may choose new targets for the copy.)
import { casualty, copySpell, defineCard, is, keyword, on, staticAbility, timesPaid, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// a baixa concedida por Anhelo é paga à parte da baixa que a mágica já tiver (CR 702.153b)
const CHAVE = 'casualty:anhelo';
const BAIXA = { ...casualty(2).cost, key: CHAVE };

export default defineCard({
  name: 'Anhelo, the Painter',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      // CR 702.153a, primeira parte: o custo adicional opcional, só na primeira instantânea ou feitiço do turno
      staticAbility({
        rules: {
          grantedAdditionalCosts: (c, p, magica) => {
            if (p !== c.you || !is.instantOrSorcery(c, magica)) return null;
            // a contagem do turno só sobe quando a mágica termina de ser conjurada
            return (c.g.state.turnStats[p]?.instantSorceryCast ?? 0) === 0 ? [BAIXA] : null;
          },
        },
        text: 'A primeira mágica instantânea ou feitiço que você conjura em cada turno tem baixa 2.',
      }),
      // segunda parte: quando você conjura a mágica, se a baixa foi paga, copie-a (ruling 3: a cópia resolve antes)
      triggered(on.youCast((c, id) => timesPaid(c.g, id, CHAVE) > 0), function* (c) {
        yield* copySpell(c.g, c.event.spell as ObjId, c.you, { newTargets: true });
      }, { text: 'Baixa 2: quando você conjura essa mágica, se o custo de baixa foi pago, copie-a. Você pode escolher novos alvos para a cópia.' }),
    ],
  }],
  rulings: {
    1: 'teste: a primeira instantânea ou feitiço do turno pode sacrificar uma criatura com força 2 ou mais para ser copiada',
    2: 'regra geral: CR 702.153a — só uma criatura é sacrificada e a mágica é copiada uma vez (motor/conjurar-alternativo.ts casualty)',
    3: 'teste: a primeira instantânea ou feitiço do turno pode sacrificar uma criatura com força 2 ou mais para ser copiada',
    4: 'regra geral: CR 707.10 — a cópia não é conjurada (motor/stack.ts copySpell)',
  },
});
