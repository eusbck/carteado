// Skithiryx, the Blight Dragon
// Flying
// Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison
// counters.)
// {B}: Skithiryx gains haste until end of turn.
// {B}{B}: Regenerate Skithiryx.
import { activated, defineCard, keywords, regenerate, untilEndOfTurn } from '../../motor/api.ts';
import { INFECTAR } from '../jin.ts';

export default defineCard({
  name: 'Skithiryx, the Blight Dragon',
  faces: [{
    abilities: [
      ...keywords('flying', 'infect'),
      activated('{B}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'haste' }]);
      }, { text: '{B}: Skithiryx ganha ímpeto até o fim do turno.' }),
      // rulings 1, 6 e 7: o escudo de regeneração vale para a próxima destruição do turno (CR 701.19)
      activated('{B}{B}', function* (c) { if (c.g.state.objects[c.source]?.zone === 'battlefield') regenerate(c, c.source); }, { text: '{B}{B}: Regenere Skithiryx.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 701.19a — regenerar só cria o escudo: pode ser ativada fora do combate, com ele virado ou sem dano (motor/criaturas.ts regenerate)',
    2: INFECTAR.emVez,
    3: INFECTAR.veneno,
    4: INFECTAR.ficam,
    5: INFECTAR.eDano,
    6: 'teste: {B}{B} regenera: em vez de ser destruído, fica virado e sem dano',
    7: 'regra geral: CR 701.19a — usado o escudo, ele não é destruído, o dano marcado some, ele fica virado e sai do combate (motor/actions.ts regenerateOrDestroy)',
  },
});