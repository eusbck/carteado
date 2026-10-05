// Abstract Paintmage
// At the beginning of your first main phase, add {U}{R}. Spend this mana only to cast instant and sorcery spells.
import { addMana, defineCard, defineFn, isType, on, triggered, type G } from '../../motor/api.ts';

const RESTRICAO = 'Abstract Paintmage:instantaneasFeiticos';
defineFn(RESTRICAO, (g: G, purpose: { kind: string; obj?: number }) =>
  purpose.kind === 'spell' && purpose.obj !== undefined && (isType(g, purpose.obj, 'Instant') || isType(g, purpose.obj, 'Sorcery')));

export default defineCard({
  name: 'Abstract Paintmage',
  faces: [{
    abilities: [triggered(on.firstMain(), function* (c) {
      addMana(c.g, c.you, ['U', 'R'], { source: c.source, restriction: RESTRICAO });
    }, { text: 'No início da sua primeira fase principal, adicione {U}{R}. Gaste essa mana só para conjurar mágicas instantâneas e feitiços.' })],
  }],
  rulings: {},
});
