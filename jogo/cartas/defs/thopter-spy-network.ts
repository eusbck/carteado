// Thopter Spy Network
// At the beginning of your upkeep, if you control an artifact, create a 1/1 colorless Thopter artifact creature token with flying.
// Whenever one or more artifact creatures you control deal combat damage to a player, draw a card.
import { createTokens, defineCard, on, triggered } from '../../motor/api.ts';
import { artifactCombatDraw, artifacts } from '../artefatos.ts';

export default defineCard({
  name: "Thopter Spy Network",
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function*(c) { yield* createTokens(c.g, c.you, 'Thopter', 1); }, { condition: (c) => artifacts(c).length > 0, text: 'Na sua manutenção, se controla um artefato, crie um Thopter incolor 1/1 com voar.' }),
      artifactCombatDraw(true),
    ]
  }],
  rulings: {
    "1": "CR 603.4: teste: verifica artefato ao disparar e novamente na resolução.",
    "2": "CR 603.2c, 510.2: teste: um gatilho por jogador atingido por lote de dano de combate; primeiro golpe e golpe duplo são lotes separados."
  },
});
