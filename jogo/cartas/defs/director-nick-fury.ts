// Director Nick Fury
// Hero spells you cast cost {1} less to cast.
// Whenever you attack, look at the top four cards of your library. You may reveal a Hero card from among them and put
// that card into your hand. Put the rest on the bottom of your library in a random order.
import { chooseItems, defineCard, moveObjects, nameOf, objItem, on, staticAbility, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import { ehHeroi } from '../vingadores.ts';

export default defineCard({
  name: 'Director Nick Fury',
  faces: [{
    abilities: [
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.subtypes.includes('Hero') ? { reduce: 1 } : null) },
        text: 'As mágicas de Hero que você conjura custam {1} a menos para conjurar.',
      }),
      triggered(on.youAttack(), function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 4);
        if (!topo.length) return;
        const itens = topo.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: s.objects[id].def }, disabled: !ehHeroi(c.g, id) }));
        const esc = yield* chooseItems(c.g, c.you, 'Director Nick Fury: você pode revelar um Hero entre as quatro cartas do topo', itens, 0, 1);
        const pego = esc.length ? Number(esc[0]) : null;
        if (pego !== null) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, pego)}.`, { rule: '701.20' });
          yield* moveObjects(c.g, [{ id: pego, to: 'hand' }], 'effect');
        }
        const resto = shuffle(s.rng, topo.filter((id) => id !== pego && s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      }, { text: 'Sempre que você ataca, olhe as quatro cartas do topo do seu grimório. Você pode revelar uma carta de Hero entre elas e colocá-la na sua mão. Coloque o resto no fundo do seu grimório em ordem aleatória.' }),
    ],
  }],
  rulings: {},
});