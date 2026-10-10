// Foundry Inspector
// Artifact spells you cast cost {1} less to cast.
import { defineCard, } from '../../motor/api.ts';
import { artifactReduction } from '../artefatos.ts';

export default defineCard({
  name: "Foundry Inspector",
  faces: [{ abilities: [artifactReduction()] }],
  rulings: {
    "1": "CR 601.2b, 601.2f: X é anunciado antes de reduzir o custo; teste de redução genérica sem alterar o valor de mana.",
    "2": "CR 601.2f-g, 117.2e: o custo fica fixado antes das habilidades de mana; não há prioridade no anúncio."
  },
});
