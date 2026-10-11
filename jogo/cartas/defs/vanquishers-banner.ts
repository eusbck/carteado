// Vanquisher's Banner
// As this artifact enters, choose a creature type.
// Creatures you control of the chosen type get +1/+1.
// Whenever you cast a creature spell of the chosen type, draw a card.
import { and, anthem, asEnters, chars, chooseCreatureType, defineCard, draw, is, on, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const escolhido = (c: SCtx): string | undefined => c.g.state.objects[c.source]?.choices.creatureType as string | undefined;

export default defineCard({
  name: "Vanquisher's Banner",
  faces: [{
    abilities: [
      // rulings 1, 5: escolhido ao entrar, sem respostas (CR 614.12a); o bônus vale na hora
      asEnters(function* (c, ev) {
        ev.choices.creatureType = yield* chooseCreatureType(c.g, c.you, "Vanquisher's Banner: escolha um tipo de criatura");
      }, 'Ao entrar, escolha um tipo de criatura.'),
      anthem(and(is.creature, is.yours, (c, id) => { const t = escolhido(c); return !!t && chars(c.g, id).subtypes.includes(t); }), () => [{ k: 'pt', p: 1, t: 1 }], 'As criaturas que você controla do tipo escolhido recebem +1/+1.'),
      // rulings 2, 6: resolve antes da mágica de criatura, mesmo que ela seja anulada
      triggered(on.youCast((c, id) => { const t = escolhido(c); return !!t && is.creature(c, id) && chars(c.g, id).subtypes.includes(t); }), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você conjura uma mágica de criatura do tipo escolhido, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: as suas criaturas do tipo escolhido recebem +1/+1 e conjurar uma delas compra uma carta',
    2: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica de criatura, mesmo que ela seja anulada',
    3: 'regra geral: CR 205.3m — só tipos de criatura existentes são oferecidos, um só (motor/efeitos.ts chooseCreatureType)',
    4: 'regra geral: CR 120.6 — o dano fica marcado até a limpeza; sem o bônus, pode virar letal (motor/sba.ts)',
    5: 'teste: as suas criaturas do tipo escolhido recebem +1/+1 e conjurar uma delas compra uma carta',
    6: 'regra geral: CR 603.3 — o gatilho resolve antes da mágica de criatura, mesmo que ela seja anulada',
  },
});
