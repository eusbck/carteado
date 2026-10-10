// Etherium Sculptor
// Artifact spells you cast cost {1} less to cast.
import { defineCard, } from '../../motor/api.ts';
import { artifactReduction } from '../artefatos.ts';

export default defineCard({
  name: "Etherium Sculptor",
  faces: [{ abilities: [artifactReduction()] }],
  rulings: {
    "1": "CR 118.7, 202.3: reduz o custo total após custos adicionais/alternativos; não altera o custo impresso nem o valor de mana.",
    "2": "CR 118.7a: só reduz mana genérica; teste: preserva o símbolo azul."
  },
});
