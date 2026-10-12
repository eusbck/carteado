// Chrome Mox
// Imprint — When this artifact enters, you may exile a nonartifact, nonland card from your hand.
// {T}: Add one mana of any of the exiled card's colors.
import { chars, chooseItems, defineCard, etb, exile, isLand, isType, linkedExiled, mana, nameOf, objItem } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Chrome Mox',
  faces: [{
    abilities: [
      etb(function* (c) {
        const cartas = c.g.state.zones.hand[c.you].filter((id) => !isType(c.g, id, 'Artifact') && !isLand(c.g, id));
        if (!cartas.length || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        const esc = yield* chooseItems(c.g, c.you, 'Chrome Mox: você pode exilar da mão uma carta que não é artefato nem terreno', cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* exile(c.g, [Number(esc[0])], { linkTo: { obj: c.source, key: 'imprint' } });
      }, { text: 'Imprimir — Quando este artefato entra, você pode exilar da sua mão uma carta que não é artefato nem terreno.' }),
      // rulings 1-3: sem carta exilada ou com carta incolor, não gera mana; nunca gera {C}; multicolorida: uma cor por vez
      mana((c) => {
        const cores = new Set<ManaType>();
        for (const id of linkedExiled(c.g, c.source)) if (c.g.state.objects[id]?.zone === 'exile') for (const cor of chars(c.g, id).colors) cores.add(cor as ManaType);
        return [...cores].map((cor) => [cor]);
      }, { text: '{T}: Adicione uma mana de qualquer uma das cores da carta exilada.' }),
    ],
  }],
  rulings: {
    1: 'teste: gera mana da cor da carta exilada; sem carta exilada, não gera mana',
    2: 'regra geral: CR 105.1 — as cores são cinco e incolor não é uma delas: a habilidade nunca gera {C} (cartas/defs/chrome-mox.ts)',
    3: 'regra geral: CR 605.1a — com carta multicolorida, você escolhe uma das cores a cada ativação (motor/costs.ts manaOptions)',
  },
});