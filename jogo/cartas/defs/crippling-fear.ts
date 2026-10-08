// Crippling Fear
// Choose a creature type. Creatures that aren't of the chosen type get -3/-3 until end of turn.
import { allCreatures, allCreatureTypes, chars, chooseItems, creaturesOf, defineCard, isSubtype, untilEndOfTurn } from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/api.ts';

// CR 205.3g-i, 205.3k: subtipos de artefato, encantamento, terreno e mágica não são tipos de criatura (CR 205.3m),
// mesmo quando aparecem numa linha de tipo de criatura ou kindred ("Kindred Enchantment — Eldrazi Aura",
// "Enchantment Creature — Saga Drake"); allCreatureTypes() do motor os inclui
const NAO_SAO_TIPOS_DE_CRIATURA = new Set([
  'Attraction', 'Blood', 'Bobblehead', 'Book', 'Clue', 'Contraption', 'Equipment', 'Food', 'Fortification', 'Gold', 'Heartwood',
  'Incubator', 'Infinity', 'Junk', 'Lander', 'Map', 'Mutagen', 'Powerstone', 'Spacecraft', 'Stone', 'Treasure', 'Vehicle', 'Vibranium',
  'Aura', 'Background', 'Cartouche', 'Case', 'Class', 'Curse', 'Plan', 'Role', 'Room', 'Rune', 'Saga', 'Shard', 'Shrine',
  'Cave', 'Desert', 'Forest', 'Gate', 'Island', 'Lair', 'Locus', 'Mine', 'Mountain', 'Plains', 'Planet', 'Power-Plant', 'Sphere',
  'Swamp', 'Tower', 'Town', "Urza's",
  'Adventure', 'Arcane', 'Lesson', 'Omen', 'Trap',
]);

function* escolherTipo(c: Ctx): Gen<string> {
  // sugere primeiro os tipos das suas criaturas, como chooseCreatureType do motor
  const meus = new Set(creaturesOf(c.g, c.you).flatMap((id) => chars(c.g, id).subtypes));
  const todos = allCreatureTypes().filter((x) => !NAO_SAO_TIPOS_DE_CRIATURA.has(x));
  const ordem = [...todos.filter((x) => meus.has(x)), ...todos.filter((x) => !meus.has(x))];
  const [tipo] = yield* chooseItems(c.g, c.you, 'Crippling Fear: escolha um tipo de criatura', ordem.map((x) => ({ id: x, label: x })), 1, 1);
  return tipo;
}

export default defineCard({
  name: 'Crippling Fear',
  faces: [{
    spell: {
      *effect(c) {
        // rulings 1-2: escolhido na resolução, só um tipo de criatura existente
        const tipo = yield* escolherTipo(c);
        c.g.log(`${c.g.state.players[c.you].name} escolhe ${tipo}.`);
        // ruling 3: conjunto fixado na resolução (CR 611.2c)
        untilEndOfTurn(c, allCreatures(c.g).filter((id) => !isSubtype(c.g, id, tipo)), [{ k: 'pt', p: -3, t: -3 }]);
      },
    },
  }],
  rulings: {
    1: 'teste: o tipo é escolhido na resolução',
    2: 'teste: só tipos de criatura existentes aparecem na escolha',
    3: 'teste: CR 611.2c: quem entra ou muda de tipo depois não é afetado',
  },
});
