// Command Tower — {T}: Add one mana of any color in your commander's color identity. (CR 903.4, 903.4f)
import { defineCard, manaCommanderIdentity } from '../../motor/api.ts';

export default defineCard({ name: 'Command Tower', faces: [{ abilities: [manaCommanderIdentity()] }] });
