// The Odd Acorn Gang
// Reach, menace, trample
// Squirrels you control have "{T}: Target Squirrel gets +2/+2 and gains trample until end of turn. Activate only as a
// sorcery."
// Whenever one or more Squirrels you control deal combat damage to a player, draw a card.
import { activated, anthem, and, chars, defineAbility, defineCard, draw, is, keywords, lkiChars, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

const BOTA = defineAbility('The Odd Acorn Gang:bota', activated('{T}', function* (c) {
  const id = tgt(c);
  if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'trample' }]);
}, {
  timing: 'sorcery',
  targets: [t.creature((c, id) => chars(c.g, id).subtypes.includes('Squirrel'), 'Squirrel alvo')],
  text: '{T}: O Squirrel alvo recebe +2/+2 e ganha atropelar até o fim do turno. Ative somente como feitiço.',
}));

export default defineCard({
  name: 'The Odd Acorn Gang',
  faces: [{
    abilities: [
      ...keywords('reach', 'menace', 'trample'),
      anthem(and(is.creature, is.subtype('Squirrel'), is.yours), () => [{ k: 'addAbility', id: BOTA.id! }],
        'Os Squirrels que você controla têm "{T}: O Squirrel alvo recebe +2/+2 e ganha atropelar até o fim do turno. Ative somente como feitiço."'),
      // "um ou mais": um disparo por lote de dano de combate (CR 603.2c)
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.controller === c.you
        && !!lkiChars(c.g, e.source)?.subtypes.includes('Squirrel'))), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que um ou mais Squirrels que você controla causam dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
