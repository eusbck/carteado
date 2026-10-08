// Skrelv's Hive
// At the beginning of your upkeep, you lose 1 life and create a 1/1 colorless Phyrexian Mite artifact creature token
// with toxic 1 and "This token can't block."
// Corrupted — As long as an opponent has three or more poison counters, creatures you control with toxic have
// lifelink.
import { controllerOf, corrupted, createTokens, defineCard, hasKw, isCreature, loseLife, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Skrelv's Hive",
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        loseLife(c.g, c.you, 1, c.source);
        yield* createTokens(c.g, c.you, 'Phyrexian Mite', 1);
      }, { text: 'No início da sua manutenção, você perde 1 de vida e cria uma ficha de artefato criatura Phyrexian Mite incolor 1/1 com tóxico 1 e "Esta ficha não pode bloquear."' }),
      // Corrompido: vale enquanto algum oponente tiver três ou mais marcadores de veneno
      staticAbility({
        affects: (c, o) => isCreature(c.g, o.id) && hasKw(c.g, o.id, 'toxic') && controllerOf(c.g, o.id) === c.you,
        mods: () => [{ k: 'addKeyword', kw: 'lifelink' }],
        condition: (c) => corrupted(c.g, c.you),
        text: 'Corrompido — Enquanto um oponente tiver três ou mais marcadores de veneno, as criaturas que você controla com tóxico têm vínculo com a vida.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o marcador de veneno não depende de quanto dano foi causado',
    2: 'teste: dano de combate a criatura não dá veneno',
    3: 'teste: a criatura com tóxico causa o dano normal e o jogador também recebe veneno',
    4: 'não se aplica: nenhuma carta dos decks substitui marcadores postos em jogadores (Vorinclex)',
    5: 'regra geral: CR 702.164b (motor) — o valor tóxico total soma todas as instâncias (testes/regras-veneno-emblema-atordoar.test.ts)',
    6: 'teste: com corrompido, o vínculo com a vida acontece junto com o veneno',
    7: 'regra geral: CR 704.5c (motor) — dez marcadores de veneno: perde o jogo (testes/regras-veneno-emblema-atordoar.test.ts)',
  },
});
