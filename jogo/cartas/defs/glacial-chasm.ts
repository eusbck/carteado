// Glacial Chasm
// Cumulative upkeep—Pay 2 life.
// When this land enters, sacrifice a land.
// Creatures you control can't attack.
// Prevent all damage that would be dealt to you.
import { controllerOf, cumulativeUpkeepLife, defineCard, etb, staticAbility } from '../../motor/api.ts';
import { sacrificaTerrenos } from '../terras.ts';

export default defineCard({
  name: 'Glacial Chasm',
  faces: [{
    abilities: [
      // CR 702.24a com custo de vida (motor/terrenos.ts)
      cumulativeUpkeepLife(2),
      // ruling 1: sem outro terreno, sacrifica ele mesmo
      etb(function* (c) { yield* sacrificaTerrenos(c, c.you, 1); }, { text: 'Quando este terreno entra, sacrifique um terreno.' }),
      staticAbility({ rules: { canAttack: (c, atacante) => controllerOf(c.g, atacante) !== c.you }, text: 'As criaturas que você controla não podem atacar.' }),
      staticAbility({ rules: { preventsDamage: (c, alvo) => alvo.kind === 'player' && alvo.id === c.you }, text: 'Previna todo o dano que seria causado a você.' }),
    ],
  }],
  rulings: { 1: 'teste: sem outro terreno, sacrifica a si mesmo' },
});
