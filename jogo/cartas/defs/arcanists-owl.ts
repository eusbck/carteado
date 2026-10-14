// Arcanist's Owl
// Flying
// When this creature enters, look at the top four cards of your library. You may reveal an artifact or enchantment card
// from among them and put it into your hand. Put the rest on the bottom of your library in a random order.
import { chooseItems, defineCard, etb, isType, keyword, moveObjects, nameOf } from '../../motor/api.ts';
import type { ChoiceItem } from '../../motor/types.ts';
import { restoNoFundo } from '../veiculos.ts';

export default defineCard({
  name: "Arcanist's Owl",
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 4);
        if (!topo.length) return;
        const pode = (id: number) => isType(c.g, id, 'Artifact') || isType(c.g, id, 'Enchantment');
        const itens: ChoiceItem[] = topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: !pode(id) }));
        const esc = itens.some((i) => !i.disabled)
          ? yield* chooseItems(c.g, c.you, "Arcanist's Owl: você pode revelar uma carta de artefato ou encantamento e colocá-la na mão", itens, 0, 1)
          : [];
        const escolhida = esc.length ? Number(esc[0]) : null;
        if (escolhida !== null) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, escolhida)}.`, { rule: '701.20' });
          yield* moveObjects(c.g, [{ id: escolhida, to: 'hand' }], 'effect');
        }
        restoNoFundo(c.g, c.you, topo.filter((id) => id !== escolhida));
      }, { text: 'Quando esta criatura entra, olhe as quatro cartas do topo do seu grimório. Você pode revelar uma carta de artefato ou encantamento dentre elas e colocá-la na sua mão. Coloque o resto no fundo do grimório em ordem aleatória.' }),
    ],
  }],
  rulings: {},
});
