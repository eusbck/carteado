// Imposter Mech
// You may have this Vehicle enter as a copy of a creature an opponent controls, except it's a Vehicle artifact with crew
// 3 and it loses all other card types. (It's not a creature unless it's crewed.)
// Crew 3
import { controllerOf, crew, defineAbility, defineCard, entersAsCopy, isCreature } from '../../motor/api.ts';

// a tripulação da exceção da cópia (CR 707.9b: vira valor copiável)
const TRIPULAR_3 = defineAbility('Imposter Mech:tripular3', crew(3));

export default defineCard({
  name: 'Imposter Mech',
  faces: [{
    abilities: [
      // CR 707.5, 707.9b, 614.1c. Ruling 1: perde os subtipos ligados aos tipos perdidos (os tipos de criatura); ruling 2:
      // copiando uma criatura que também é planeswalker, perde os dois tipos
      entersAsCopy({
        label: 'Imposter Mech', what: 'uma criatura de um oponente',
        text: 'Você pode fazer este Veículo entrar como uma cópia de uma criatura que um oponente controla, exceto que é um artefato Vehicle com tripular 3 e perde os outros tipos de carta.',
        candidates: (c, ev) => c.g.state.zones.battlefield.filter((id) => isCreature(c.g, id) && c.g.isOpponent(ev.controller, controllerOf(c.g, id))),
        except: () => ({ addTypes: ['Artifact'], removeOtherTypes: true, addSubtypes: ['Vehicle'], addAbilities: [TRIPULAR_3.id!] }),
      }),
      crew(3),
    ],
  }],
  rulings: {
    1: 'teste: entra como cópia de uma criatura do oponente, artefato Vehicle sem tipos de criatura e com tripular 3',
    2: 'regra geral: CR 707.9b — a exceção troca todos os tipos de carta por artefato, também o de planeswalker (motor/chars.ts applyExcept)',
  },
});
