// Chief of the Foundry
// Other artifact creatures you control get +1/+1.
import { defineCard, } from '../../motor/api.ts';
import { otherArtifactAnthem } from '../artefatos.ts';

export default defineCard({
  name: "Chief of the Foundry",
  faces: [{ abilities: [otherArtifactAnthem()] }],
  rulings: {
    "1": "CR 704.5g: teste: dano antes não letal pode se tornar letal quando Chief sai e o bônus desaparece."
  },
});
