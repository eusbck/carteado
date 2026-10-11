// Sarkhan, Dragon Ascendant
// When Sarkhan enters, you may behold a Dragon. If you do, create a Treasure token. (To behold a Dragon, choose a Dragon
// you control or reveal a Dragon card from your hand.)
// Whenever a Dragon you control enters, put a +1/+1 counter on Sarkhan. Until end of turn, Sarkhan becomes a Dragon in
// addition to his other types and gains flying.
import { addCounters, and, behold, chars, createTokens, defineCard, etb, is, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Sarkhan, Dragon Ascendant',
  faces: [{
    abilities: [
      etb(function* (c) {
        // CR 701.4a; ruling 1: só um permanente Dragon seu ou uma carta de Dragon da mão
        const visto = yield* behold(c, (id) => chars(c.g, id).subtypes.includes('Dragon'), 'um Dragon', { optional: true });
        // ruling 2: contemplou, cria a ficha, aconteça o que acontecer depois com o que foi contemplado
        if (visto) yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Quando Sarkhan entra, você pode contemplar um Dragon. Se fizer isso, crie uma ficha de Treasure. (Para contemplar um Dragon, escolha um Dragon que você controla ou revele uma carta de Dragon da sua mão.)' }),
      triggered(on.enters(and(is.yours, is.subtype('Dragon'))), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        untilEndOfTurn(c, [c.source], [{ k: 'addTypes', subtypes: ['Dragon'] }, { k: 'addKeyword', kw: 'flying' }]);
      }, { text: 'Sempre que um Dragon que você controla entra, coloque um marcador +1/+1 em Sarkhan. Até o fim do turno, Sarkhan se torna um Dragon além dos outros tipos dele e ganha voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: contemplar aceita um Dragon que você controla ou uma carta de Dragon da mão; contemplando, cria um Treasure',
    2: 'regra geral: CR 701.4b — contemplado é contemplado, mesmo que a carta ou o permanente mude depois (motor/contemplar.ts behold)',
    3: 'não se aplica: Sarkhan contempla ao entrar, não como custo de mágica',
    4: 'não se aplica: Sarkhan contempla ao entrar, não como custo de mágica',
  },
});
