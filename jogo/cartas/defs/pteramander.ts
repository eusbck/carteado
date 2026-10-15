// Pteramander
// Flying
// {7}{U}: Adapt 4. This ability costs {1} less to activate for each instant and sorcery card in your graveyard. (If this
// creature has no +1/+1 counters on it, put four +1/+1 counters on it.)
import { activated, defineCard, keyword } from '../../motor/api.ts';
import { adaptar, instantesEFeiticosNoCemiterio } from '../saque.ts';

export default defineCard({
  name: 'Pteramander',
  faces: [{
    abilities: [
      keyword('flying'),
      activated('{7}{U}', function* (c) {
        // CR 701.46a: adaptar só põe marcadores se não houver nenhum +1/+1 (ruling 2)
        adaptar(c.g, c.source, 4, c.you);
      }, {
        // CR 601.2f, 602.2b: reduz só o genérico (ruling 1: nunca abaixo de {U})
        selfCost: (c) => ({ reduce: instantesEFeiticosNoCemiterio(c.g, c.you).length }),
        text: '{7}{U}: Adaptar 4. Esta habilidade custa {1} a menos para ativar para cada carta de instantânea e de feitiço no seu cemitério. (Se esta criatura não tiver marcadores +1/+1, coloque quatro marcadores +1/+1 nela.)',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com sete instantâneas e feitiços no cemitério, custa só {U}',
    2: 'teste: dá para ativar com um marcador +1/+1 já nela, mas não põe nenhum',
    3: 'teste: sem marcadores +1/+1 de novo, adapta outra vez',
  },
});
