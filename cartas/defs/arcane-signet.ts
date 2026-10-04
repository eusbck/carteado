// Arcane Signet — {T}: Add one mana of any color in your commander's color identity. (CR 903.4, 903.4f)
import { defineCard, manaCommanderIdentity } from '../../motor/api.ts';

export default defineCard({ name: 'Arcane Signet', faces: [{ abilities: [manaCommanderIdentity()] }] });
