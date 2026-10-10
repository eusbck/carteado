// Master of Etherium
// Master of Etherium's power and toughness are each equal to the number of artifacts you control.
// Other artifact creatures you control get +1/+1.
import { defineCard, } from '../../motor/api.ts';
import { artifactSize, otherArtifactAnthem } from '../artefatos.ts';

export default defineCard({
  name: "Master of Etherium",
  faces: [{ abilities: [artifactSize(), otherArtifactAnthem()] }],
  rulings: {
    "1": "CR 604.3, 613.4a: teste: CDA vale na mão, campo, cemitério e exílio.",
    "2": "teste: no campo conta o próprio Master of Etherium.",
    "3": "CR 704.5g: testes de regressão: perder um artefato reduz a resistência; perder o Master remove o bônus das outras criaturas."
  },
});
