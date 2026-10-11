// Herald's Horn
// As this artifact enters, choose a creature type.
// Creature spells you cast of the chosen type cost {1} less to cast.
// At the beginning of your upkeep, look at the top card of your library. If it's a creature card of the chosen type,
// you may reveal it and put it into your hand.
import { asEnters, chars, chooseCreatureType, defineCard, isCreature, moveObjects, nameOf, on, staticAbility, triggered, yesNo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

/** CR 607.2d: o tipo escolhido ao entrar fica gravado no objeto */
const escolhido = (c: SCtx): string | undefined => c.g.state.objects[c.source]?.choices.creatureType as string | undefined;

export default defineCard({
  name: "Herald's Horn",
  faces: [{
    abilities: [
      // CR 614.12a: escolhido antes de entrar; ruling 5: só tipos de criatura existentes; ruling 3: um tipo só
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, "Herald's Horn: escolha um tipo de criatura");
      }, 'Ao entrar, escolha um tipo de criatura.'),
      // rulings 1 e 4: só tira mana genérica do custo total (CR 601.2f); ruling 2: sem tipo escolhido, nada fica mais barato
      staticAbility({
        rules: {
          costModifier: (c, spell) => {
            const tipo = escolhido(c);
            return tipo && spell.controller === c.you && spell.chars.types.includes('Creature') && spell.chars.subtypes.includes(tipo) ? { reduce: 1 } : null;
          },
        },
        text: 'As mágicas de criatura do tipo escolhido que você conjura custam {1} a menos.',
      }),
      triggered(on.upkeep('you'), function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you][0];
        if (topo === undefined) return;
        const tipo = escolhido(c);
        c.g.log(`${s.players[c.you].name} olha a carta do topo do grimório (Herald's Horn).`, { visibleTo: [c.you], hiddenText: `${s.players[c.you].name} olha a carta do topo do grimório (Herald's Horn).` });
        // ruling 2: sem tipo escolhido, nunca vai para a mão; ruling 6: se não for, fica no topo sem revelar
        if (!tipo || !isCreature(c.g, topo) || !chars(c.g, topo).subtypes.includes(tipo)) return;
        if (!(yield* yesNo(c.g, c.you, `Herald's Horn: revelar ${nameOf(c.g, topo)} e pô-la na sua mão?`))) return;
        c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, topo)}.`, { rule: '701.20a' });
        yield* moveObjects(c.g, [{ id: topo, to: 'hand' }], 'effect');
      }, { text: 'No início da sua manutenção, olhe a carta do topo do seu grimório. Se for uma carta de criatura do tipo escolhido, você pode revelá-la e colocá-la na sua mão.' }),
    ],
  }],
  rulings: {
    1: 'teste: só reduz a parte genérica do custo',
    2: 'teste: sem tipo escolhido, nada fica mais barato e nada vai para a mão',
    3: 'teste: só tipos de criatura existentes aparecem na escolha, um de cada vez',
    4: 'regra geral: CR 601.2f, 118.7a — aumentos antes das reduções; valor de mana inalterado (motor/stack.ts)',
    5: 'teste: só tipos de criatura existentes aparecem na escolha, um de cada vez',
    6: 'teste: sem pôr na mão, a carta fica no topo e é comprada na etapa de compra',
  },
});
