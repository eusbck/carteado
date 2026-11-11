// Braids, Arisen Nightmare
// At the beginning of your end step, you may sacrifice an artifact, creature, enchantment, land, or planeswalker. If you
// do, each opponent may sacrifice a permanent of their choice that shares a card type with it. For each opponent who
// doesn't, that player loses 2 life and you draw a card.
import { chooseItems, controlledBy, defineCard, draw, lkiChars, loseLife, nameOf, objItem, on, sacrifice, triggered, yesNo } from '../../motor/api.ts';
import { chars } from '../../motor/api.ts';

const TIPOS = ['Artifact', 'Creature', 'Enchantment', 'Land', 'Planeswalker'];

export default defineCard({
  name: 'Braids, Arisen Nightmare',
  faces: [{
    abilities: [triggered(on.endStep('you'), function* (c) {
      const meus = controlledBy(c.g, c.you, (id) => chars(c.g, id).types.some((x) => TIPOS.includes(x)));
      if (!meus.length || !(yield* yesNo(c.g, c.you, 'Braids: sacrificar um permanente?'))) return;
      const [esc] = yield* chooseItems(c.g, c.you, 'Sacrifique um artefato, criatura, encantamento, terreno ou planeswalker', meus.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
      const id = Number(esc);
      const tipos = chars(c.g, id).types.filter((x) => TIPOS.includes(x));
      const [foi] = yield* sacrifice(c.g, [id]);
      if (foi === null || foi === undefined) return;
      void lkiChars;
      for (const p of c.g.apnap().filter((x) => c.g.isOpponent(c.you, x))) {
        const deles = controlledBy(c.g, p, (x) => chars(c.g, x).types.some((t) => tipos.includes(t)));
        let sacrificou = false;
        if (deles.length && (yield* yesNo(c.g, p, `Braids: sacrificar um permanente que compartilhe um tipo (${tipos.join(', ')})? Se não, você perde 2 de vida e o oponente compra uma carta.`))) {
          const [e2] = yield* chooseItems(c.g, p, 'Sacrifique um permanente', deles.map((x) => objItem(c.g, x, nameOf(c.g, x))), 1, 1);
          sacrificou = (yield* sacrifice(c.g, [Number(e2)]))[0] != null;
        }
        if (!sacrificou) { loseLife(c.g, p, 2, c.source); yield* draw(c.g, c.you, 1); }
      }
    }, { text: 'No início da sua etapa final, você pode sacrificar um artefato, criatura, encantamento, terreno ou planeswalker. Se fizer isso, cada oponente pode sacrificar um permanente que compartilhe um tipo de card com ele. Para cada oponente que não fizer isso, ele perde 2 de vida e você compra uma carta.'.replace('tipo de card', 'tipo de carta') })],
  }],
  rulings: { 1: 'regra geral: CR 101.4 — os oponentes decidem na ordem de turno, sabendo o que os anteriores fizeram' },
});
