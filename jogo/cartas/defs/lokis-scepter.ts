// Loki's Scepter
// When Loki's Scepter enters, gain control of target creature until end of turn. Untap that creature. Until end of turn,
// it becomes a Villain in addition to its other types and gains haste.
// {T}: Add one mana of any color.
import { defineCard, etb, gainControl, mana, t, tgt, untap, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Loki's Scepter",
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        gainControl(c.g, id, c.you, { kind: 'endOfTurn' }, c.source);
        untap(c.g, id);
        untilEndOfTurn(c, [id], [{ k: 'addTypes', subtypes: ['Villain'] }, { k: 'addKeyword', kw: 'haste' }]);
      }, { targets: [t.creature()], text: "Quando Loki's Scepter entra, ganhe o controle da criatura alvo até o fim do turno. Desvire essa criatura. Até o fim do turno, ela vira um Villain além dos outros tipos e ganha ímpeto." }),
      mana('any'),
    ],
  }],
  rulings: {},
});
