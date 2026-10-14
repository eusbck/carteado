// Toski, Bearer of Secrets
// This spell can't be countered.
// Indestructible
// Toski attacks each combat if able.
// Whenever a creature you control deals combat damage to a player, draw a card.
import { defineCard, draw, keywords, lkiChars, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Toski, Bearer of Secrets',
  faces: [{
    // ruling 1: pode ser alvo de quem anula, mas não é anulada (o resto do efeito acontece)
    cantBeCountered: true,
    abilities: [
      ...keywords('indestructible'),
      // ruling 2: se não puder atacar (virada, enjoo) ou se houver custo, não é obrigada (CR 508.1d)
      staticAbility({ rules: { attacksIfAble: (c, id) => id === c.source }, text: 'Toski ataca a cada combate se puder.' }),
      // uma compra por criatura que causa dano de combate a um jogador
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.controller === c.you && !!lkiChars(c.g, e.source)?.types.includes('Creature')), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura que você controla causa dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.6 — a mágica que não pode ser anulada continua na pilha; o resto do efeito de quem anula acontece (motor/stack.ts counter)',
    2: 'teste: ataca a cada combate se puder; com enjoo de invocação, não',
  },
});
