// Diregraf Colossus
// This creature enters with a +1/+1 counter on it for each Zombie card in your graveyard.
// Whenever you cast a Zombie spell, create a tapped 2/2 black Zombie creature token.
import { createTokens, defineCard, entersWithCounters, is, isSubtype, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Diregraf Colossus',
  faces: [{
    abilities: [
      // CR 614.1c: contado enquanto entra; ruling 1: se vier do cemitério, conta a si mesmo e quem entra junto de lá
      entersWithCounters('+1/+1', (c) => c.g.state.zones.graveyard[c.you].filter((id) => isSubtype(c.g, id, 'Zombie')).length),
      // ruling 2: não dispara ao conjurar a si mesmo (ainda não está no campo)
      triggered(on.youCast(is.subtype('Zombie')), function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie 2/2', 1, { tapped: true });
      }, { text: 'Sempre que você conjura uma mágica de Zombie, crie uma ficha de criatura Zombie preta 2/2 virada.' }),
    ],
  }],
  rulings: {
    1: 'teste: vindo do cemitério, conta a si mesmo entre os Zombies',
    2: 'teste: entra com um marcador +1/+1 por carta de Zombie no seu cemitério; não dispara ao conjurar a si mesmo',
  },
});
