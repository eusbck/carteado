// Firdoch Core
// Changeling (This card is every creature type.)
// {T}: Add one mana of any color.
// {4}: This artifact becomes a 4/4 artifact creature until end of turn.
import { activated, changeling, defineCard, mana, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Firdoch Core',
  faces: [{
    abilities: [
      // rulings 1-4: kindred tem tipos de criatura sem ser criatura; o polimorfo funciona em todas as zonas (CR 702.73a)
      changeling(),
      mana('any'),
      // ruling 7: a força e a resistência base 4/4 (camada 7b) por cima de efeitos anteriores que as definem
      activated('{4}', function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        untilEndOfTurn(c, [c.source], [{ k: 'addTypes', types: ['Creature'] }, { k: 'setPT', p: 4, t: 4 }]);
      }, { text: '{4}: Este artefato vira uma criatura artefato 4/4 até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: é de todos os tipos de criatura sem ser criatura; com {4}, vira criatura artefato 4/4 até o fim do turno',
    2: 'teste: é de todos os tipos de criatura sem ser criatura; com {4}, vira criatura artefato 4/4 até o fim do turno',
    3: 'regra geral: CR 702.73a — o polimorfo é uma habilidade que define característica, aplicada antes de perder habilidades (motor/criaturas.ts changeling)',
    4: 'teste: na mão também é de todos os tipos de criatura',
    5: 'regra geral: CR 613.4 — marcadores e modificadores de força valem por cima da base (motor/chars.ts)',
    6: 'não se aplica: o tipo antigo "tribal" não tem efeito no jogo',
    7: 'regra geral: CR 613.4b — o efeito que define a base mais recente vence (motor/chars.ts)',
    8: 'não se aplica: nenhuma carta dos decks conta tipos de carta no cemitério',
    9: 'regra geral: CR 613.1d, 702.73a — o efeito que muda o tipo de criatura vem depois do polimorfo (motor/chars.ts)',
  },
});
