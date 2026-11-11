// The Ur-Dragon
// Eminence — As long as The Ur-Dragon is in the command zone or on the battlefield, other Dragon spells you cast cost
// {1} less to cast.
// Flying
// Whenever one or more Dragons you control attack, draw that many cards, then you may put a permanent card from your
// hand onto the battlefield.
import {
  chars, chooseItems, controllerOf, defineCard, draw, isPermanentCard, keyword, nameOf, objItem, on, putOntoBattlefield, staticAbility, triggered,
} from '../../motor/api.ts';

export default defineCard({
  name: 'The Ur-Dragon',
  faces: [{
    abilities: [
      // eminência: a estática diz em que zonas funciona (CR 113.6b); na pilha ela não reduz o próprio custo
      staticAbility({
        zones: ['battlefield', 'command'],
        rules: {
          costModifier: (c, spell) => (spell.controller === c.you && spell.obj !== c.source && spell.chars.subtypes.includes('Dragon') ? { reduce: 1 } : null),
        },
        text: 'Eminência — Enquanto The Ur-Dragon estiver na zona de comando ou no campo, as outras mágicas de Dragon que você conjura custam {1} a menos.',
      }),
      keyword('flying'),
      // ruling 3: só a declaração de atacantes dispara (CR 508.3a); quem entra atacando nunca "atacou" (508.4)
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers' || e.player !== c.you) return false;
        const n = e.attackers.filter((a) => c.g.state.objects[a.obj] && controllerOf(c.g, a.obj) === c.you && chars(c.g, a.obj).subtypes.includes('Dragon')).length;
        return n > 0 ? { n } : false;
      }), function* (c) {
        // ruling 1: a quantidade é a dos Dragons que atacaram, mesmo que algum tenha saído do campo
        yield* draw(c.g, c.you, c.event.n as number);
        // ruling 2: uma carta só, qualquer que seja o número de Dragons
        const cands = c.g.state.zones.hand[c.you].filter((id) => isPermanentCard(c.g, id));
        if (!cands.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'The Ur-Dragon: você pode colocar uma carta de permanente da sua mão no campo', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* putOntoBattlefield(c.g, [{ id: Number(esc[0]), controller: c.you }], 'effect');
      }, { text: 'Sempre que um ou mais Dragons que você controla atacam, compre essa quantidade de cartas e depois você pode colocar uma carta de permanente da sua mão no campo.' }),
    ],
  }],
  rulings: {
    1: 'teste: compra uma carta para cada Dragon que atacou, mesmo que um tenha saído do campo',
    2: 'teste: coloca só uma carta de permanente da mão no campo',
    3: 'regra geral: CR 508.4 — quem entra atacando não foi declarado atacante e não dispara (testado em The Ur-Sphinx)',
    4: 'teste: a criatura posta no campo não está atacando',
  },
});
