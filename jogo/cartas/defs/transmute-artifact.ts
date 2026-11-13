// Transmute Artifact
// Sacrifice an artifact. If you do, search your library for an artifact card. If that card's mana value is less than or
// equal to the sacrificed artifact's mana value, put it onto the battlefield. If it's greater, you may pay {X}, where X
// is the difference. If you do, put it onto the battlefield. If you don't, put it into its owner's graveyard. Then
// shuffle.
import { chars, chooseItems, controlledBy, defineCard, isType, manaValue, mayPay, moveObjects, nameOf, objItem, putOntoBattlefield, sacrifice, searchLibrary, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Transmute Artifact',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 1: o sacrifício é parte do efeito, não custo; ruling 4: um artefato só
        const meus = controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact'));
        if (!meus.length) return;
        const [r] = yield* chooseItems(c.g, c.you, 'Transmute Artifact: sacrifique um artefato', meus.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        const escolhido = Number(r);
        const mvSac = manaValue(c.g, escolhido);
        const [sac] = yield* sacrifice(c.g, [escolhido]);
        if (sac === null || sac === undefined) return;
        // ruling 6: a busca pede uma característica, então pode não achar nada
        const [achada] = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => chars(c.g, id).types.includes('Artifact'), prompt: `Transmute Artifact: procure uma carta de artefato (o sacrificado tinha valor de mana ${mvSac})` });
        if (achada !== undefined) {
          const dif = manaValue(c.g, achada) - mvSac;
          // ruling 5: com valor de mana menor ou igual, entra sem pagar; ruling 2: a diferença é paga na resolução
          const entra = dif <= 0 || (yield* mayPay(c, c.you, `{${dif}}`, `pôr ${nameOf(c.g, achada)} no campo (Transmute Artifact)`));
          if (entra) yield* putOntoBattlefield(c.g, [{ id: achada, controller: c.you }], 'search');
          else yield* moveObjects(c.g, [{ id: achada, to: 'graveyard' }], 'search');
        }
        shuffleLibrary(c.g, c.you);
      },
    },
  }],
  rulings: {
    1: 'teste: sem artefato para sacrificar, nada acontece',
    2: 'teste: com valor de mana maior, pode pagar a diferença na resolução; sem pagar, a carta vai para o cemitério',
    3: 'regra geral: CR 601.2 — pôr no campo não é conjurar',
    4: 'regra geral: CR 701.21 — sacrifica um artefato só (escolhido na resolução)',
    5: 'teste: com valor de mana menor ou igual, entra no campo sem pagar',
    6: 'regra geral: CR 701.23d — a busca pede característica e pode não achar nada (motor/actions.ts searchLibrary)',
  },
});
