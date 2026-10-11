// Avengers Tower
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a Hero spell or to activate an ability of a Hero source.
// {4}, {T}: Look at the top three cards of your library. You may reveal a Hero card from among them and put it into
// your hand. Put the rest on the bottom of your library in any order.
import { activated, chars, chooseItems, defineCard, defineFn, mana, moveObjects, nameOf, type G } from '../../motor/api.ts';
import type { ChoiceItem } from '../../motor/types.ts';

const heroi = (g: G, id: number) => chars(g, id).subtypes.includes('Hero');

// CR 106.6: mana com restrição de gasto — mágica Hero ou habilidade de uma fonte Hero
const RESTRICAO = 'Avengers Tower:hero';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) =>
  (purpose.kind === 'spell' || purpose.kind === 'ability') && purpose.obj !== undefined && !!g.state.objects[purpose.obj] && heroi(g, purpose.obj));

export default defineCard({
  name: 'Avengers Tower',
  faces: [{
    abilities: [
      mana('C'),
      mana('any', { restriction: RESTRICAO, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana apenas para conjurar uma mágica Hero ou ativar uma habilidade de uma fonte Hero.' }),
      activated('{4}, {T}', function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 3);
        if (topo.length === 0) return;
        const itens = (ids: number[], filtro?: (id: number) => boolean): ChoiceItem[] => ids.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: filtro ? !filtro(id) : false }));
        const [esc] = yield* chooseItems(c.g, c.you, 'Avengers Tower: você pode revelar uma carta Hero entre as três do topo e pô-la na mão', itens(topo, (id) => heroi(c.g, id)), 0, 1);
        const escolhida = esc !== undefined ? Number(esc) : null;
        if (escolhida !== null) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, escolhida)}.`, { rule: '701.20' });
          yield* moveObjects(c.g, [{ id: escolhida, to: 'hand' }], 'effect');
        }
        // o resto vai para o fundo na ordem que você escolher (a primeira escolhida fica mais em cima)
        const resto = topo.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library');
        const ordem = resto.length > 1 ? (yield* chooseItems(c.g, c.you, 'Ordem das cartas que vão para o fundo (a primeira fica mais em cima)', itens(resto), resto.length, resto.length, true)).map(Number) : resto;
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !ordem.includes(id)), ...ordem];
        c.g.bump();
      }, { text: '{4}, {T}: Olhe as três cartas do topo do seu grimório. Você pode revelar uma carta Hero entre elas e pô-la na mão. Coloque o resto no fundo do grimório em qualquer ordem.' }),
    ],
  }],
  rulings: {},
});
