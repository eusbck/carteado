// Shore Leave Planet
// This land enters tapped.
// {T}: Add {U}.
// {4}{U}: This land becomes a copy of target creature you control until end of turn, except it isn't legendary and
// it's a Robot artifact in addition to its other types.
import { activated, becomeCopy, defineCard, is, land, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Shore Leave Planet',
  faces: [{
    abilities: [
      land.tapped(),
      mana('U'),
      activated('{4}{U}', function* (c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[c.source]?.zone === 'battlefield') {
          becomeCopy(c, c.source, id, { except: { legendary: false, addTypes: ['Artifact'], addSubtypes: ['Robot'] }, duration: { kind: 'endOfTurn' } });
        }
      }, {
        targets: [t.creature(is.yours, 'criatura alvo que você controla')],
        text: '{4}{U}: Este terreno vira uma cópia da criatura alvo que você controla até o fim do turno, exceto que não é lendário e é um artefato Robot além dos outros tipos.',
      }),
    ],
  }],
  rulings: {},
});
