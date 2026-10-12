// Imotekh the Stormlord
// Phaeron — Whenever one or more artifact cards leave your graveyard, create two 2/2 black Necron Warrior artifact
// creature tokens.
// Grand Strategist — At the beginning of combat on your turn, another target artifact creature you control gets +2/+2
// and gains menace until end of turn.
import { and, chars, defineCard, is, lkiChars, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { criaNecronWarriors, ehCriaturaArtefato } from '../necrons.ts';

export default defineCard({
  name: 'Imotekh the Stormlord',
  faces: [{
    abilities: [
      // ruling 1: várias cartas saindo ao mesmo tempo disparam uma vez só
      triggered(on.batch((evs, c) => evs.some((e) => {
        if (e.type !== 'zone' || e.from !== 'graveyard' || e.owner !== c.you || e.token) return false;
        // a carta como estava no cemitério; sem essa informação, como ficou na zona nova
        const ch = lkiChars(c.g, e.old) ?? (c.g.state.objects[e.obj] ? chars(c.g, e.obj) : null);
        return !!ch && ch.types.includes('Artifact');
      })), function* (c) { yield* criaNecronWarriors(c, 2); }, {
        text: 'Phaeron — Sempre que uma ou mais cartas de artefato saem do seu cemitério, crie duas fichas de criatura artefato Necron Warrior 2/2 pretas.',
      }),
      triggered(on.beginCombat('you'), function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'menace' }]);
      }, {
        targets: [t.creature(and(is.yours, is.other, (c, id) => ehCriaturaArtefato(c.g, id)), 'outra criatura artefato alvo que você controla')],
        text: 'Grand Strategist — No início do combate no seu turno, outra criatura artefato alvo que você controla recebe +2/+2 e ganha ameaçar até o fim do turno.',
      }),
    ],
  }],
  rulings: { 1: 'teste: cartas de artefato saindo juntas do seu cemitério criam só dois Necron Warriors' },
});