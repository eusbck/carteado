// Command Tower — {T}: Add one mana of any color in your commander's color identity. (CR 903.4, 903.4f)
import { defineCard, manaCommanderIdentity } from '../../motor/api.ts';

export default defineCard({ name: 'Command Tower', faces: [{ abilities: [manaCommanderIdentity()] }],
  rulings: {
    1: "teste (arcane-signet.test.ts): com dois comandantes, a identidade combinada",
    2: "teste (arcane-signet.test.ts): comandante incolor não faz produzir {C}",
    3: "teste (arcane-signet.test.ts): CR 903.4f: sem comandante, não produz mana",
  },
});
