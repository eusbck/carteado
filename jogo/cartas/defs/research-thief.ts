// Research Thief
// Flash
// Flying
// Whenever an artifact creature you control deals combat damage to a player, draw a card.
import { defineCard, keyword } from '../../motor/api.ts';
import { artifactCombatDraw } from '../artefatos.ts';

export default defineCard({
  name: "Research Thief",
  faces: [{ abilities: [keyword('flash'), keyword('flying'), artifactCombatDraw(false)] }],
  rulings: {},
});
