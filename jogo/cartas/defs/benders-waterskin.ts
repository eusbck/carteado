// Bender's Waterskin
// Untap this artifact during each other player's untap step.
// {T}: Add one mana of any color.
import { controllerOf, defineCard, mana, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Bender's Waterskin",
  faces: [{
    abilities: [
      // CR 502.3: desvira junto com o jogador ativo, sem escolha (ruling 2). Ruling 1: "não desvira durante a etapa de
      // desvirar do controlador" não vale na etapa dos outros
      staticAbility({
        rules: { untapDuringUntapOf: (c, obj, ativo) => obj === c.source && ativo !== controllerOf(c.g, c.source) },
        text: 'Desvire este artefato durante a etapa de desvirar de cada outro jogador.',
      }),
      mana('any'),
    ],
  }],
  rulings: {
    1: 'não se aplica: nas cartas dos decks, o "não desvira na sua etapa de desvirar" só fala da própria permanente (Mana Vault, Grim Monolith)',
    2: 'teste: desvira na etapa de desvirar de cada outro jogador',
  },
});
