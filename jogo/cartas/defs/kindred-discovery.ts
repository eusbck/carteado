// Kindred Discovery
// As this enchantment enters, choose a creature type.
// Whenever a creature you control of the chosen type enters or attacks, draw a card.
import { asEnters, chars, chooseCreatureType, controllerOf, defineCard, draw, isCreature, on, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import { tipoEscolhido } from '../vingadores.ts';

// ruling 4: sem tipo escolhido, não dispara
const serve = (c: SCtx, id: number): boolean => {
  const tipo = tipoEscolhido(c);
  return !!tipo && !!c.g.state.objects[id] && isCreature(c.g, id) && controllerOf(c.g, id) === c.you && chars(c.g, id).subtypes.includes(tipo);
};

export default defineCard({
  name: 'Kindred Discovery',
  faces: [{
    abilities: [
      // CR 614.12: escolhido antes de entrar (ruling 2); só tipos de criatura existentes, um só (rulings 1 e 3)
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, 'Kindred Discovery: escolha um tipo de criatura');
      }, 'Conforme este encantamento entra, escolha um tipo de criatura.'),
      // um gatilho para cada criatura que entra ou ataca
      triggered(on.custom((e, c) => {
        if (e.type === 'zone' && e.to === 'battlefield') return serve(c, e.obj);
        if (e.type === 'attackers') return e.attackers.filter((a) => serve(c, a.obj)).map(() => ({}));
        return false;
      }), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que uma criatura do tipo escolhido que você controla entra ou ataca, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 205.3m — escolhe-se um tipo de criatura só; a criatura com dois tipos conta para qualquer um deles (motor/efeitos.ts chooseCreatureType)',
    2: 'regra geral: CR 614.12 — o tipo é escolhido antes de entrar; as criaturas que entram junto já contam (CR 603.6a)',
    3: 'regra geral: CR 205.3m — só tipos de criatura existentes podem ser escolhidos (motor/efeitos.ts chooseCreatureType)',
    4: 'teste: sem tipo escolhido, não dispara',
  },
});