// Zagoth Triome — ({T}: Add {B}, {G}, or {U}.) This land enters tapped. Cycling {3}
import { cycling, defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Zagoth Triome',
  faces: [{ abilities: [land.tapped(), mana(['B', 'G', 'U']), cycling('{3}')] }],
  rulings: {},
});
