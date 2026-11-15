// Practiced Offense
// Put a +1/+1 counter on each creature target player controls. Target creature gains your choice of double strike
// or lifelink until end of turn.
// Flashback {1}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { addCounters, chooseOne, creaturesOf, defineCard, flashback, t, tgt, tgtPlayer, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Practiced Offense',
  faces: [{
    altCosts: [flashback('{1}{W}')],
    spell: {
      targets: [t.player(), t.creature()],
      *effect(c) {
        const jogador = tgtPlayer(c);
        if (jogador !== null) {
          for (const id of creaturesOf(c.g, jogador)) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
        }
        const criatura = tgt(c, 1);
        if (criatura === null) return;
        // CR 608.2d: a escolha da habilidade é feita na resolução.
        const kw = yield* chooseOne(c.g, c.you, 'Practiced Offense: escolha a habilidade', [
          { id: 'double strike', label: 'Golpe duplo' },
          { id: 'lifelink', label: 'Vínculo com a vida' },
        ]);
        untilEndOfTurn(c, [criatura], [{ k: 'addKeyword', kw }]);
      },
    },
  }],
  rulings: {
    1: 'teste: CR 702.34a: conjura diretamente do cemitério por duas manas e exila ao resolver',
    2: 'teste: CR 702.34a: conjura diretamente do cemitério por duas manas e exila ao resolver',
    3: 'regra geral: CR 117.3b — o jogador ativo recebe prioridade depois da resolução (motor)',
    4: 'teste: CR 702.34a: conjura diretamente do cemitério por duas manas e exila ao resolver',
    5: 'teste: a retrospectiva exila a carta mesmo se a mágica for anulada',
    6: 'teste: a retrospectiva segue o tempo de feitiço',
  },
});
