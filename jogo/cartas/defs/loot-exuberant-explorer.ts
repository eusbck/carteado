// Loot, Exuberant Explorer
// You may play an additional land on each of your turns.
// {4}{G}{G}, {T}: Look at the top six cards of your library. You may reveal a creature card with mana value less than or
// equal to the number of lands you control from among them and put it onto the battlefield. Put the rest on the bottom
// in a random order.
import { activated, chooseItems, controlledBy, defineCard, isCreature, isLand, manaValue, nameOf, putOntoBattlefield, staticAbility } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ChoiceItem } from '../../motor/types.ts';

export default defineCard({
  name: 'Loot, Exuberant Explorer',
  faces: [{
    abilities: [
      // CR 305.2: soma com os outros efeitos de terreno adicional (ruling 1)
      staticAbility({
        rules: { extraLandPlays: (c, jogador) => (jogador === c.you ? 1 : 0) },
        text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.',
      }),
      activated('{4}{G}{G}, {T}', function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 6);
        if (!topo.length) return;
        // ruling 2: X no custo vale 0 (o valor de mana da carta no grimório)
        const terrenos = controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length;
        const pode = (id: number) => isCreature(c.g, id) && manaValue(c.g, id) <= terrenos;
        const itens: ChoiceItem[] = topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: !pode(id) }));
        const esc = itens.some((i) => !i.disabled)
          ? yield* chooseItems(c.g, c.you, `Loot: você pode revelar uma carta de criatura com valor de mana até ${terrenos} e colocá-la no campo`, itens, 0, 1)
          : [];
        const escolhida = esc.length ? Number(esc[0]) : null;
        if (escolhida !== null) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, escolhida)}.`, { rule: '701.20' });
          yield* putOntoBattlefield(c.g, [{ id: escolhida, controller: c.you }], 'effect');
        }
        const resto = shuffle(s.rng, topo.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      }, { text: '{4}{G}{G}, {T}: Olhe as seis cartas do topo do seu grimório. Você pode revelar uma carta de criatura com valor de mana menor ou igual ao número de terrenos que você controla e colocá-la no campo. Coloque o resto no fundo em ordem aleatória.' }),
    ],
  }],
  rulings: {
    1: 'teste: você pode jogar dois terrenos no seu turno',
    2: 'regra geral: CR 202.3e — X no custo de uma carta fora da pilha vale 0 (motor/chars.ts)',
  },
});
