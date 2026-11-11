// Locutus of Borg
// Lifelink
// Artifact creatures you control have "Whenever this creature deals combat damage to a player, create a 1/1
// colorless Borg artifact creature token."
import { and, anthem, createTokens, defineAbility, defineCard, is, keyword, on, triggered } from '../../motor/api.ts';

const FICHA = defineAbility('Locutus of Borg:ficha', triggered(on.selfDealsCombatDamageToPlayer(), function* (c) { yield* createTokens(c.g, c.you, 'Borg', 1); },
  { text: 'Sempre que esta criatura causa dano de combate a um jogador, crie uma ficha de criatura-artefato Borg 1/1 incolor.' }));

export default defineCard({
  name: 'Locutus of Borg',
  faces: [{
    abilities: [
      keyword('lifelink'),
      anthem(and(is.creature, is.artifact, is.yours), () => [{ k: 'addAbility', id: FICHA.id! }], 'As criaturas-artefato que você controla têm "Sempre que esta criatura causa dano de combate a um jogador, crie uma ficha de criatura-artefato Borg 1/1 incolor."'),
    ],
  }],
  rulings: {},
});
