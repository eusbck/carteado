// Ruthless Technomancer
// When this creature enters, you may sacrifice another creature you control. If you do, create a number of Treasure
// tokens equal to that creature's power.
// {2}{B}, Sacrifice X artifacts: Return target creature card with power X or less from your graveyard to the
// battlefield. X can't be 0.
import {
  activated, chars, chooseItems, controlledBy, createTokens, defineCard, etb, isCreature, isType, nameOf, objItem, power,
  putOntoBattlefield, sacrifice, t, tgt,
} from '../../motor/api.ts';

export default defineCard({
  name: 'Ruthless Technomancer',
  faces: [{
    abilities: [
      etb(function* (c) {
        const g = c.g;
        const outras = controlledBy(g, c.you, (id) => id !== c.source && isCreature(g, id));
        if (!outras.length) return;
        const [esc] = yield* chooseItems(g, c.you, 'Ruthless Technomancer: você pode sacrificar outra criatura para criar Tesouros', [
          { id: 'nao', label: 'Não sacrificar' }, ...outras.map((id) => objItem(g, id, nameOf(g, id))),
        ], 1, 1);
        if (esc === 'nao') return;
        const id = Number(esc);
        yield* sacrifice(g, [id]);
        // a força pela última informação da criatura (CR 608.2h)
        const n = Math.max(0, g.state.lki[id]?.chars.power ?? 0);
        if (n > 0) yield* createTokens(g, c.you, 'Treasure', n);
      }, { text: 'Quando esta criatura entra, você pode sacrificar outra criatura que você controla. Se fizer isso, crie uma quantidade de fichas de Tesouro igual à força dela.' }),
      activated('{2}{B}, Sacrifice X artifacts', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        // "X não pode ser 0": o alvo exige X de 1 para cima
        xMax: (c) => controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length,
        targets: [t.card('graveyard', (c, id) => {
          const x = (c as { x?: number }).x;
          return chars(c.g, id).types.includes('Creature') && (x === undefined || (x >= 1 && power(c.g, id) <= x));
        }, 'carta de criatura alvo com força X ou menos no seu cemitério')],
        condition: (c) => controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length >= 1,
        text: '{2}{B}, Sacrifique X artefatos: Devolva a carta de criatura alvo com força X ou menos do seu cemitério ao campo. X não pode ser 0.',
      }),
    ],
  }],
  rulings: {},
});
