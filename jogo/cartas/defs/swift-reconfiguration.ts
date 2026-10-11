// Swift Reconfiguration
// Flash
// Enchant creature or Vehicle
// Enchanted permanent is a Vehicle artifact with crew 5 and it loses all other card types. (It's not a creature unless
// it's crewed.)
import { attachedGets, crew, defineAbility, defineCard, is, keyword, or, t } from '../../motor/api.ts';

const TRIPULAR = defineAbility('Swift Reconfiguration:tripular', crew(5));

export default defineCard({
  name: 'Swift Reconfiguration',
  faces: [{
    enchant: t.permanent(or(is.creature, is.subtype('Vehicle')), 'criatura ou Vehicle'),
    abilities: [
      keyword('flash'),
      // camada 4: só artefato, só Vehicle (rulings 3-4: perde planeswalker e Equipment); camada 6: ganha tripular 5 e
      // fica com as outras habilidades (ruling 1). Tripulada, o efeito de tripular é mais novo e a faz criatura artefato
      attachedGets(() => [
        { k: 'setTypes', types: ['Artifact'], subtypes: ['Vehicle'], keepSupertypes: true },
        { k: 'addAbility', id: TRIPULAR.id! },
      ], 'A permanente encantada é um artefato Vehicle com tripular 5 e perde todos os outros tipos de carta. (Ela não é criatura a menos que seja tripulada.)'),
    ],
  }],
  rulings: {
    1: 'teste: a criatura encantada vira um artefato Vehicle com tripular 5 e fica com as habilidades',
    2: 'teste: CR 506.4: encantada enquanto ataca, sai do combate',
    3: 'regra geral: CR 205.1a — o tipo novo substitui os outros tipos de carta, inclusive planeswalker (motor/chars.ts setTypes)',
    4: 'regra geral: CR 205.1a — os subtipos também são substituídos: deixa de ser Equipment (motor/chars.ts setTypes)',
  },
});
