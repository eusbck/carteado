// Savvy Trader
// When this creature enters, exile target permanent card from your graveyard. You may play that card for as long as it
// remains exiled.
// Spells you cast from anywhere other than your hand cost {1} less to cast.
import { allowPlay, defineCard, etb, exile, is, staticAbility, t, tgt } from '../../motor/api.ts';
import { ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Savvy Trader',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const [ex] = yield* exile(c.g, [id]);
        // ruling 1: a permissão é de quem controlava o gatilho, mesmo que Savvy Trader saia do campo
        if (ex !== null && ex !== undefined && c.g.state.objects[ex]?.zone === 'exile') allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' });
      }, {
        targets: [t.card('graveyard', is.permanentCard, 'carta de permanente alvo do seu cemitério')],
        text: 'Quando esta criatura entra, exile a carta de permanente alvo do seu cemitério. Você pode jogar essa carta enquanto ela continuar exilada.',
      }),
      // rulings 3-4: reduz só o genérico do custo total (CR 601.2f)
      staticAbility({
        rules: { costModifier: (c, sp) => (sp.controller === c.you && sp.castFrom !== 'hand' ? { reduce: 1 } : null) },
        text: 'As mágicas que você conjura de qualquer lugar que não seja a sua mão custam {1} a menos para serem conjuradas.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: exila uma carta de permanente do seu cemitério; você a conjura do exílio por {1} a menos',
    2: ROUBO.tempo,
    3: 'regra geral: CR 601.2f — muda só o custo total, não o valor de mana (motor/stack.ts totalSpellCost)',
    4: 'teste: a redução não paga mana colorida',
  },
});
