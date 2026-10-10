// Thopter Fabricator
// Flying
// Whenever you draw your second card each turn, create a 1/1 colorless Thopter artifact creature token with flying.
// Crew 2
import { createTokens, crew, defineCard, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Thopter Fabricator",
  faces: [{ abilities: [keyword('flying'), crew(2), triggered(on.custom((e, c) => e.type === 'draw' && e.player === c.you && e.nth === 2), function*(c) { yield* createTokens(c.g, c.you, 'Thopter', 1); }, { text: 'Sempre que você compra sua segunda carta em cada turno, crie um Thopter incolor 1/1 com voar.' })] }],
  rulings: {},
});
