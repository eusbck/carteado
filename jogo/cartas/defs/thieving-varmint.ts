// Thieving Varmint
// Deathtouch, lifelink
// {T}, Pay 1 life: Add two mana of any one color. Spend this mana only to cast spells you don't own.
import { controllerOf, defineCard, defineFn, keywords, mana, type G } from '../../motor/api.ts';
import type { ManaUnit } from '../../motor/types.ts';

// "Gaste essa mana somente para conjurar mágicas que você não possui": quem gasta é quem controlava o Varmint
const RESTRICAO = 'Thieving Varmint:magicasDeOutros';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }, u: ManaUnit) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined || u.source === null) return false;
  const magica = g.state.objects[purpose.obj];
  const quem = g.state.objects[u.source] ? controllerOf(g, u.source) : g.state.lki[u.source]?.chars.controller;
  return !!magica && quem !== undefined && magica.owner !== quem;
});

export default defineCard({
  name: 'Thieving Varmint',
  faces: [{
    abilities: [
      ...keywords('deathtouch', 'lifelink'),
      mana(() => [['W', 'W'], ['U', 'U'], ['B', 'B'], ['R', 'R'], ['G', 'G']], {
        cost: '{T}, Pay 1 life', restriction: RESTRICAO,
        text: '{T}, Pague 1 de vida: Adicione duas manas de uma mesma cor qualquer. Gaste essa mana somente para conjurar mágicas que você não possui.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a mana paga uma mágica de outro dono; não paga uma sua',
  },
});
