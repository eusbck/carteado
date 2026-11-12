// Ezuri, Renegade Leader
// {G}: Regenerate another target Elf.
// {2}{G}{G}{G}: Elf creatures you control get +3/+3 and gain trample until end of turn.
import { activated, and, defineCard, is, regenerate, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { criaturasElfoDe } from '../voja.ts';

export default defineCard({
  name: 'Ezuri, Renegade Leader',
  faces: [{
    abilities: [
      // ruling 1: "outro" Elfo alvo: não o próprio Ezuri
      activated('{G}', function* (c) {
        const id = tgt(c);
        if (id !== null) regenerate(c, id);
      }, { targets: [t.permanent(and(is.other, is.subtype('Elf')), 'outro Elfo alvo')], text: '{G}: Regenere outro Elfo alvo.' }),
      // ruling 2: só os Elfos que você controla na resolução (CR 611.2c)
      activated('{2}{G}{G}{G}', function* (c) {
        untilEndOfTurn(c, criaturasElfoDe(c.g, c.you), [{ k: 'pt', p: 3, t: 3 }, { k: 'addKeyword', kw: 'trample' }]);
      }, { text: '{2}{G}{G}{G}: As criaturas Elfo que você controla recebem +3/+3 e ganham atropelar até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: regenera outro Elfo, mas não pode mirar ele mesmo; o segundo inclui o próprio Ezuri',
    2: 'teste: só os Elfos que você controla na resolução recebem +3/+3 e atropelar',
  },
});
