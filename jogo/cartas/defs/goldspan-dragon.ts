// Goldspan Dragon
// Flying, haste
// Whenever this creature attacks or becomes the target of a spell, create a Treasure token.
// Treasures you control have "{T}, Sacrifice this artifact: Add two mana of any one color."
import { and, anthem, createTokens, defineAbility, defineCard, is, keywords, mana, on, triggered } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

const tesouro = defineAbility('Goldspan Dragon:tesouro', mana(() => (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((c) => [c, c]), {
  cost: '{T}, Sacrifice this artifact', text: '{T}, Sacrifique este artefato: Adicione duas manas de uma cor qualquer.',
}));

function* tesouroNovo(c: Parameters<Parameters<typeof triggered>[1]>[0]) { yield* createTokens(c.g, c.you, 'Treasure', 1); }

export default defineCard({
  name: 'Goldspan Dragon',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      triggered(on.selfAttacks(), tesouroNovo, { text: 'Sempre que esta criatura ataca, crie uma ficha de Tesouro.' }),
      // ruling 1: mirada várias vezes pela mesma mágica, dispara uma vez (um lote de eventos de alvo)
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'target' && e.spell && e.target.kind === 'obj' && e.target.id === c.source)), tesouroNovo, {
        text: 'Sempre que esta criatura se torna alvo de uma mágica, crie uma ficha de Tesouro.',
      }),
      anthem(and(is.subtype('Treasure'), is.yours), () => [{ k: 'addAbility', id: tesouro.id! }], 'Os Tesouros que você controla têm "{T}, Sacrifique este artefato: Adicione duas manas de uma cor qualquer."'),
    ],
  }],
  rulings: {
    1: 'teste: mirada pela mesma mágica, dispara uma vez',
    2: 'teste: CR 603.3: o gatilho resolve antes da mágica',
    3: 'regra geral: CR 117.3b — prioridade depois de cada resolução',
  },
});
