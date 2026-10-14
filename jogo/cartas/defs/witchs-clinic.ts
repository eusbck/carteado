// Witch's Clinic
// {T}: Add {C}.
// {2}, {T}: Target commander gains lifelink until end of turn.
import { activated, defineCard, mana, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { ehComandante } from '../vingadores.ts';

export default defineCard({
  name: "Witch's Clinic",
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'lifelink' }]);
      }, { targets: [t.permanent((c, id) => ehComandante(c.g, id), 'comandante alvo')], text: '{2}, {T}: O comandante alvo ganha vínculo com a vida até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
