// Darksteel Juggernaut
// Indestructible
// Darksteel Juggernaut's power and toughness are each equal to the number of artifacts you control.
// This creature attacks each combat if able.
import { defineCard, keyword, staticAbility } from '../../motor/api.ts';
import { artifactSize } from '../artefatos.ts';

export default defineCard({
  name: "Darksteel Juggernaut",
  faces: [{ abilities: [keyword('indestructible'), artifactSize(), staticAbility({ rules: { attacksIfAble: (c, id) => id === c.source }, text: 'Ataca a cada combate se puder.' })] }],
  rulings: {
    "1": "teste: conta a si mesmo; F/R no campo é pelo menos 1, salvo mudança de tipo.",
    "2": "CR 702.12, 704.5f: indestrutível impede destruição/dano letal, mas não sacrifício nem resistência zero.",
    "3": "CR 302.6, 508.1d: teste: virado, com enjoo ou sem ataque gratuito não precisa atacar; não obriga pagar Propaganda.",
    "4": "CR 604.3: CDA de F/R funciona em todas as zonas, não a habilidade de indestrutível."
  },
});
