// Buster Sword
// Equipped creature gets +3/+2.
// Whenever equipped creature deals combat damage to a player, draw a card, then you may cast a spell from your hand with
// mana value less than or equal to that damage without paying its mana cost.
// Equip {2}
import { attachedGets, chooseItems, defineCard, draw, equip, isLand, manaValue, mayCastFree, nameOf, objItem, triggered } from '../../motor/api.ts';
import { anexadaCausaDanoDeCombateAJogador } from '../jin.ts';

export default defineCard({
  name: 'Buster Sword',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 3, t: 2 }], 'A criatura equipada recebe +3/+2.'),
      // ruling 1: a mágica é conjurada durante a resolução, sem as restrições de tempo do tipo dela
      triggered(anexadaCausaDanoDeCombateAJogador(), function* (c) {
        yield* draw(c.g, c.you, 1);
        const dano = Number(c.event.dano ?? 0);
        const cartas = c.g.state.zones.hand[c.you].filter((id) => !isLand(c.g, id) && manaValue(c.g, id) <= dano);
        if (!cartas.length) return;
        const esc = yield* chooseItems(c.g, c.you, `Buster Sword: você pode conjurar sem pagar uma mágica da mão com valor de mana até ${dano}`, cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* mayCastFree(c.g, c.you, Number(esc[0]));
      }, { text: 'Sempre que a criatura equipada causa dano de combate a um jogador, compre uma carta e depois você pode conjurar uma mágica da sua mão com valor de mana menor ou igual a esse dano sem pagar o custo de mana.' }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: no dano de combate a um jogador, compra uma carta e pode conjurar de graça uma mágica da mão com valor de mana até o dano',
    2: 'regra geral: CR 107.3b — sem pagar o custo de mana, o X do custo só pode ser 0 (motor/stack.ts)',
    3: 'regra geral: CR 118.9a — sem pagar o custo de mana não cabem custos alternativos; os adicionais continuam (motor/stack.ts)',
  },
});