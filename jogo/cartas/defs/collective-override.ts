// Collective Override
// Choose one. If you control a commander as you cast this spell, you may choose both instead.
// • Create a 1/1 colorless Borg artifact creature token for each attacking creature.
// • Draw a card for each attacking creature.
import { allCreatures, defineCard, draw, isAttacking, modal } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';
import { controlaComandante } from '../wakanda.ts';
import { criaBorg } from '../borg.ts';

/** criaturas atacando (de qualquer jogador), contadas na resolução */
const atacantes = (c: Ctx) => allCreatures(c.g).filter((id) => isAttacking(c.g, id)).length;

export default defineCard({
  name: 'Collective Override',
  faces: [{
    spell: {
      // "se você controla um comandante ao conjurar": os modos são escolhidos ao conjurar (CR 601.2b)
      modes: modal(1, (c) => (controlaComandante(c.g, c.you) ? 2 : 1), [
        { text: 'Crie uma ficha de criatura artefato Borg 1/1 incolor para cada criatura atacando.', *effect(c) { yield* criaBorg(c, atacantes(c)); } },
        { text: 'Compre uma carta para cada criatura atacando.', *effect(c) { const n = atacantes(c); if (n > 0) yield* draw(c.g, c.you, n); } },
      ]),
    },
  }],
  rulings: {},
});
