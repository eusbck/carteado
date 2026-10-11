// Spark Double
// You may have this creature enter as a copy of a creature or planeswalker you control, except it enters with an
// additional +1/+1 counter on it if it's a creature, it enters with an additional loyalty counter on it if it's a
// planeswalker, and it isn't legendary.
import { controlledBy, defineCard, entersAsCopy, isCreature, isType } from '../../motor/api.ts';

export default defineCard({
  name: 'Spark Double',
  faces: [{
    abilities: [
      entersAsCopy({
        label: 'Spark Double', what: 'uma criatura ou planeswalker que você controla',
        text: 'Você pode fazer esta criatura entrar como uma cópia de uma criatura ou planeswalker que você controla, exceto que entra com um marcador +1/+1 adicional se for criatura, com um marcador de lealdade adicional se for planeswalker, e não é lendária.',
        candidates: (c, ev) => controlledBy(c.g, ev.controller, (id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker')),
        // ruling 2: a exceção "não é lendária" é copiável
        except: () => ({ legendary: false }),
        // rulings 7-8: os marcadores a mais dependem do que Spark Double é ao entrar, não do que o modelo é agora
        then: (_c, ev, copia) => {
          if (copia.types.includes('Creature')) ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + 1;
          if (copia.types.includes('Planeswalker')) ev.counters.loyalty = (ev.counters.loyalty ?? 0) + 1;
        },
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 707.2 — copia os valores copiáveis, sem marcadores, Auras nem efeitos (motor/mecanicas.ts copiableValues)',
    2: 'teste: entra como cópia de uma criatura lendária sua, sem ser lendária e com um marcador +1/+1 a mais',
    3: 'regra geral: CR 107.3 — X do custo do modelo vale 0 no campo',
    4: 'regra geral: CR 707.3 — copia o que o modelo estiver copiando (motor/mecanicas.ts copiableValues)',
    5: 'regra geral: CR 707.2 — copia os valores originais da ficha e não vira ficha',
    6: 'regra geral: CR 707.5 — as habilidades de entrar e os "ao entrar" do modelo funcionam (motor/criaturas.ts entersAsCopy)',
    7: 'teste: entra como cópia de uma criatura lendária sua, sem ser lendária e com um marcador +1/+1 a mais',
    8: 'regra geral: CR 707.9f — os marcadores a mais olham para o que Spark Double é ao entrar (cartas/defs/spark-double.ts)',
    9: 'regra geral: CR 614.12 — só o que já está no campo pode ser escolhido (motor/criaturas.ts entersAsCopy)',
  },
});
