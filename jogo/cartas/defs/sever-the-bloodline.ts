// Sever the Bloodline
// Exile target creature and all other creatures with the same name as that creature.
// Flashback {5}{B}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { allCreatures, chars, defineCard, exile, flashback, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Sever the Bloodline',
  faces: [{
    // CR 702.34a
    altCosts: [flashback('{5}{B}{B}')],
    spell: {
      targets: [t.creature()],
      *effect(c) {
        // rulings 3 e 13: com o alvo ilegal, nada é exilado
        const id = tgt(c);
        if (id === null) return;
        // ruling 12: o nome é o da face para cima; ruling 1: as outras não são alvo (não importa resistência a magia)
        const nome = chars(c.g, id).name;
        // ruling 11: só criaturas no campo
        const outras = nome === '' ? [] : allCreatures(c.g).filter((x) => x !== id && chars(c.g, x).name === nome);
        yield* exile(c.g, [id, ...outras]);
      },
    },
  }],
  rulings: {
    1: 'teste: exila a criatura alvo e todas as outras com o mesmo nome, de qualquer jogador',
    2: 'teste: fichas com o mesmo nome também são exiladas',
    3: 'teste: se o alvo fica ilegal, nenhuma criatura é exilada',
    4: 'teste: fichas com o mesmo nome também são exiladas',
    5: 'regra geral: CR 702.34a — a retrospectiva vale mesmo que a carta nunca tenha sido conjurada (motor/dsl.ts flashback)',
    6: 'regra geral: CR 117.3b — depois de resolver, o jogador ativo recebe a prioridade primeiro (motor/priority.ts)',
    7: 'regra geral: CR 601.2f — custo total a partir do custo alternativo (motor/stack.ts totalSpellCost)',
    8: 'teste: CR 702.34a: pela retrospectiva, é conjurada do cemitério por {5}{B}{B} e exilada depois',
    9: 'regra geral: CR 702.34a — a retrospectiva segue o tempo de feitiço (motor/priority.ts)',
    10: 'teste: CR 702.34a: pela retrospectiva, é conjurada do cemitério por {5}{B}{B} e exilada depois',
    11: 'teste: exila a criatura alvo e todas as outras com o mesmo nome, de qualquer jogador',
    12: 'regra geral: CR 712.8 — a carta de duas faces só tem o nome da face para cima (motor/chars.ts)',
    13: 'teste: se o alvo fica ilegal, nenhuma criatura é exilada',
  },
});
