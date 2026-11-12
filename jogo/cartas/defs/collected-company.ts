// Collected Company
// Look at the top six cards of your library. Put up to two creature cards with mana value 3 or less from among them
// onto the battlefield. Put the rest on the bottom of your library in any order.
import { chooseItems, defineCard, isCreature, manaValue, nameOf, putOntoBattlefield } from '../../motor/api.ts';
import type { ChoiceItem } from '../../motor/types.ts';

export default defineCard({
  name: 'Collected Company',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 6);
        if (topo.length === 0) return;
        const itens = (ids: number[], filtro?: (id: number) => boolean): ChoiceItem[] => ids.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: filtro ? !filtro(id) : false }));
        // ruling 1: cada uma com valor de mana 3 ou menos (não a soma)
        const pode = (id: number) => isCreature(c.g, id) && manaValue(c.g, id) <= 3;
        const escolhidas = topo.some(pode)
          ? (yield* chooseItems(c.g, c.you, 'Collected Company: escolha até duas cartas de criatura com valor de mana 3 ou menos para pôr no campo', itens(topo, pode), 0, 2)).map(Number)
          : [];
        if (escolhidas.length) yield* putOntoBattlefield(c.g, escolhidas.map((id) => ({ id, controller: c.you })), 'effect');
        // o resto vai para o fundo na ordem que você escolher (a primeira escolhida fica mais em cima)
        const resto = topo.filter((id) => !escolhidas.includes(id) && s.objects[id]?.zone === 'library');
        const ordem = resto.length > 1 ? (yield* chooseItems(c.g, c.you, 'Ordem das cartas que vão para o fundo (a primeira fica mais em cima)', itens(resto), resto.length, resto.length, true)).map(Number) : resto;
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !ordem.includes(id)), ...ordem];
        c.g.bump();
      },
    },
  }],
  rulings: { 1: 'teste: cada criatura pode ter valor de mana 3 ou menos; não é a soma' },
});
