// Plan for All Outcomes
// When this enchantment enters, the owner of up to one other target nonland permanent puts it on their choice of the
// top or bottom of their library.
// Whenever you cast your first noncreature spell each turn, empower Jace 1. (Put a loyalty counter on a Jace token you
// control. If you don't control one, first create a blue Jace planeswalker token with "[−1]: Surveil 1" and
// "[−3]: Draw a card.")
import { chooseOne, defineCard, etb, is, isCreature, moveObject, nameOf, on, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { empowerJace } from '../fichas.ts';

export default defineCard({
  name: 'Plan for All Outcomes',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const dono = c.g.state.objects[id].owner;
        const onde = yield* chooseOne(c.g, dono, `Plan for All Outcomes: pôr ${nameOf(c.g, id)} no topo ou no fundo do seu grimório?`, [
          { id: 'top', label: 'No topo' }, { id: 'bottom', label: 'No fundo' },
        ]);
        yield* moveObject(c.g, id, 'library', 'effect', { position: onde === 'top' ? 'top' : 'bottom' });
      }, {
        targets: [upTo(1, t.nonlandPermanent(is.other, 'até um outro permanente não terreno alvo'))],
        text: 'Quando este encantamento entra, o dono de até um outro permanente não terreno alvo o coloca no topo ou no fundo do grimório dele, à escolha dele.',
      }),
      // conta as mágicas que não são de criatura conjuradas no turno, inclusive antes de Plan estar no campo (ruling 2)
      triggered(on.custom((e, c) => e.type === 'cast' && e.player === c.you && !!c.g.state.objects[e.obj] && !isCreature(c.g, e.obj)
        && (c.g.state.turnStats[c.you].noncreatureSpellsCast ?? 0) === 1), function* (c) {
        yield* empowerJace(c, 1);
      }, { text: 'Sempre que você conjura sua primeira mágica que não seja de criatura em cada turno, fortaleça Jace 1.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem ficha de Jace, cria uma e põe 1 marcador de lealdade',
    2: 'teste: no turno em que Plan é conjurado, a segunda habilidade não dispara (Plan foi a primeira)',
    3: 'regra geral: com ficha de Jace no campo, não se cria outra (empowerJace em cartas/fichas.ts, testado em Fatehold Charm)',
    4: 'não se aplica: a habilidade que fortalece Jace não tem alvos',
    5: 'teste: o gatilho resolve antes da mágica e mesmo se ela for anulada',
    6: 'regra geral: Jace que não é ficha não recebe marcadores (empowerJace, testado em Fatehold Charm)',
  },
});
