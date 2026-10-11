// Greater Tanuki
// Trample
// Channel — {2}{G}, Discard this card: Search your library for a basic land card, put it onto the battlefield tapped,
// then shuffle.
import { activated, and, cost, defineCard, is, keyword, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Greater Tanuki',
  faces: [{
    abilities: [
      keyword('trample'),
      // Canalizar (CR 207.2c: palavra de habilidade): habilidade ativada da mão; ruling 1: descartar faz parte do custo
      activated([...cost('{2}{G}'), { k: 'discardSelf' }], function* (c) {
        yield* searchTo(c, c.you, (id) => and(is.basic, is.land)(c, id), 1, 'battlefield', { tapped: true, prompt: 'Greater Tanuki: escolha uma carta de terreno básico' });
      }, { zones: ['hand'], text: 'Canalizar — {2}{G}, Descarte esta carta: Procure no seu grimório uma carta de terreno básico, coloque-a no campo de batalha virada e depois embaralhe.' }),
    ],
  }],
  rulings: {
    1: 'teste: canalizar descarta a carta como custo e busca um terreno básico virado',
    2: 'não se aplica: a habilidade de canalizar de Greater Tanuki não tem alvo',
  },
});
