// Song of Freyalise
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I, II — Until your next turn, creatures you control gain "{T}: Add one mana of any color."
// III — Put a +1/+1 counter on each creature you control. Those creatures gain vigilance, trample, and indestructible
// until end of turn.
import { addCounters, addEffect, chapter, creaturesOf, defineAbility, defineCard, mana, sagaEnters, untilEndOfTurn } from '../../motor/api.ts';

const MANA = defineAbility('Song of Freyalise:mana', mana('any'));

export default defineCard({
  name: 'Song of Freyalise',
  faces: [{
    abilities: [
      // CR 714.3a
      sagaEnters(),
      // ruling 1: só as criaturas que você controla na resolução
      chapter([1, 2], function* (c) {
        const ids = creaturesOf(c.g, c.you);
        if (ids.length) addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'untilYourNextTurn', player: c.you, sinceTurn: c.g.state.turn.number }, affected: ids, mods: [{ k: 'addAbility', id: MANA.id! }] });
      }, { text: 'I, II — Até o seu próximo turno, as criaturas que você controla ganham "{T}: Adicione uma mana de qualquer cor."' }),
      chapter([3], function* (c) {
        const ids = creaturesOf(c.g, c.you);
        for (const id of ids) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'vigilance' }, { k: 'addKeyword', kw: 'trample' }, { k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: 'III — Coloque um marcador +1/+1 em cada criatura que você controla. Essas criaturas ganham vigilância, atropelar e indestrutível até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: capítulos I e II: as criaturas que você controla ganham "{T}: uma mana de qualquer cor" até o seu próximo turno',
    2: 'regra geral: CR 714.3a — entra com um marcador de conhecimento e ganha outro na sua primeira fase principal (motor/turn.ts)',
    3: 'regra geral: CR 714.2b — o capítulo dispara quando o número de marcadores chega ao dele (motor/mecanicas.ts chapter)',
    4: 'regra geral: CR 714.2b — o capítulo não dispara de novo com o número já alcançado (motor/mecanicas.ts chapter)',
    5: 'regra geral: CR 113.7a — na pilha, a habilidade não depende mais da Saga (motor/stack.ts)',
    6: 'regra geral: CR 603.3b — capítulos que disparam juntos vão para a pilha na ordem que você escolher (motor/stack.ts putTriggersOnStack)',
    7: 'regra geral: CR 714.2b — removidos marcadores, o capítulo dispara de novo quando o número volta a ser alcançado (motor/mecanicas.ts chapter)',
    8: 'teste: capítulo III: um marcador +1/+1 em cada criatura sua, com vigilância, atropelar e indestrutível; depois a Saga é sacrificada',
  },
});