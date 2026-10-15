// Smoldering Stagecoach
// Smoldering Stagecoach's power is equal to the number of instant and sorcery cards in your graveyard.
// Whenever this Vehicle attacks, the next instant spell and the next sorcery spell you cast this turn each have cascade.
// Crew 2
import { cascade, chars, crew, defineAbility, defineCard, delayed, on, selfGets, triggered } from '../../motor/api.ts';
import { instantesEFeiticosNoCemiterio } from '../saque.ts';

// a cascata impressa (CR 702.85a), usada pela mágica que a ganha
const CASCATA = cascade();

/**
 * "A próxima mágica instantânea [ou de feitiço] que você conjurar neste turno tem cascata": um gatilho atrasado por tipo,
 * que dispara uma vez, quando essa mágica é conjurada, e faz a cascata dela (CR 702.85a: o valor de mana é o da mágica).
 * Simplificação: a habilidade de cascata é do gatilho atrasado, não da mágica; o resultado na mesa é o mesmo.
 */
const PROXIMA = defineAbility('Smoldering Stagecoach:proxima', triggered(on.custom((e, c) => {
  const tipo = ((c as unknown as { delayed?: { data: { tipo?: string } } }).delayed?.data.tipo) ?? 'Instant';
  return e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && chars(c.g, e.obj).types.includes(tipo) ? { spell: e.obj } : false;
}), function* (c) {
  yield* CASCATA.effect({ ...c, event: { spell: c.event.spell } });
}, { text: 'Cascata (exile cartas do topo do seu grimório até exilar uma que não seja terreno e custe menos; você pode conjurá-la sem pagar o custo de mana; ponha as exiladas no fundo em ordem aleatória).' }));

export default defineCard({
  name: 'Smoldering Stagecoach',
  faces: [{
    abilities: [
      // CR 604.3: habilidade que define característica, vale em todas as zonas (ruling 1); a resistência impressa é 5
      selfGets((c) => [{ k: 'setPT', p: instantesEFeiticosNoCemiterio(c.g, c.you).length, t: 5 }], 'A força deste Veículo é igual ao número de cartas de instantânea e de feitiço no seu cemitério.', { cda: true }),
      triggered(on.selfAttacks(), function* (c) {
        const turno = c.g.state.turn.number;
        delayed(c, PROXIMA.id!, { data: { tipo: 'Instant' }, expiresTurn: turno });
        delayed(c, PROXIMA.id!, { data: { tipo: 'Sorcery' }, expiresTurn: turno });
      }, { text: 'Sempre que este Veículo ataca, a próxima mágica instantânea e a próxima mágica de feitiço que você conjurar neste turno têm cascata.' }),
      crew(2),
    ],
  }],
  rulings: {
    1: 'teste: a força conta as instantâneas e os feitiços do cemitério',
    2: 'teste: atacando, a próxima instantânea do turno tem cascata; a segunda não',
    3: 'regra geral: CR 202.3 — o valor de mana vem só do custo de mana (motor/chars.ts)',
    4: 'teste: atacando, a próxima instantânea do turno tem cascata; a segunda não',
    5: 'regra geral: CR 702.85a — exilar é obrigatório; só conjurar é opcional (motor/conjurar-alternativo.ts cascade)',
    6: 'regra geral: CR 702.85a — a cascata resolve mesmo com a mágica anulada (motor/conjurar-alternativo.ts cascade)',
    7: 'regra geral: CR 702.85a — as cartas são exiladas viradas para cima',
    8: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe custo alternativo (motor/stack.ts)',
    9: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    10: 'regra geral: CR 702.85a — a mágica resultante também precisa ter valor de mana menor (motor/conjurar-alternativo.ts cascade)',
    11: 'regra geral: CR 709.3 — da carta dividida, conjura-se uma metade (motor/stack.ts castInner)',
  },
});
