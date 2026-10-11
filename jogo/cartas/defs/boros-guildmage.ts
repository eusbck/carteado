// Boros Guildmage
// {1}{R}: Target creature gains haste until end of turn.
// {1}{W}: Target creature gains first strike until end of turn.
import { activated, defineCard, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Boros Guildmage',
  faces: [{
    abilities: [
      activated('{1}{R}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'haste' }]);
      }, { targets: [t.creature()], text: '{1}{R}: A criatura alvo ganha ímpeto até o fim do turno.' }),
      activated('{1}{W}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'first strike' }]);
      }, { targets: [t.creature()], text: '{1}{W}: A criatura alvo ganha iniciativa até o fim do turno.' }),
    ],
  }],
  rulings: {},
});