// White Sun's Twilight
// You gain X life. Create X 1/1 colorless Phyrexian Mite artifact creature tokens with toxic 1 and "This token can't
// block." If X is 5 or more, destroy all other creatures. (Players dealt combat damage by a creature with toxic 1 also
// get a poison counter.)
import { allCreatures, createTokens, defineCard, destroy, gainLife } from '../../motor/api.ts';

export default defineCard({
  name: "White Sun's Twilight",
  faces: [{
    spell: {
      *effect(c) {
        gainLife(c.g, c.you, c.x, c.source);
        const fichas = yield* createTokens(c.g, c.you, 'Phyrexian Mite', c.x);
        // "todas as outras criaturas": todas menos as fichas criadas por esta mágica
        if (c.x >= 5) yield* destroy(c.g, allCreatures(c.g).filter((id) => !fichas.includes(id)));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.164b (motor) — o valor tóxico total soma todas as instâncias (testes/regras-veneno-emblema-atordoar.test.ts)',
    2: 'teste: as fichas causam o dano normal e o jogador também recebe veneno',
    3: "regra geral: CR 702.164c (motor) — dano de combate a criatura não dá veneno (teste de Skrelv's Hive)",
    4: "regra geral: CR 702.164c (motor) — o veneno não depende da quantidade de dano (teste de Skrelv's Hive)",
    5: 'regra geral: CR 704.5c (motor) — dez marcadores de veneno: perde o jogo (testes/regras-veneno-emblema-atordoar.test.ts)',
    6: 'regra geral: CR 120.3f, 702.164c (motor) — os outros resultados do dano continuam (teste de corrompido em Skrelv\'s Hive)',
    7: 'não se aplica: nenhuma carta dos decks substitui marcadores postos em jogadores (Vorinclex)',
  },
});
