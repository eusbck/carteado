// Quintorius, Loremaster
// Vigilance
// At the beginning of your end step, exile target noncreature, nonland card from your graveyard. Create a 3/2 red and
// white Spirit creature token.
// {1}{R}{W}, {T}, Sacrifice a Spirit: Choose target card exiled with Quintorius. You may cast that card this turn without
// paying its mana cost. If that spell would be put into a graveyard, put it on the bottom of its owner's library instead.
import { activated, allowPlay, and, createTokens, defineCard, exile, is, keyword, not, on, t, tgt, triggered } from '../../motor/api.ts';

const CHAVE = 'quintorius';

export default defineCard({
  name: 'Quintorius, Loremaster',
  faces: [{
    abilities: [
      keyword('vigilance'),
      triggered(on.endStep('you'), function* (c) {
        const id = tgt(c);
        // ruling 3: com o alvo ilegal, não resolve (nem cria a ficha) — CR 608.2b
        if (id === null) return;
        yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
        yield* createTokens(c.g, c.you, 'Spirit 3/2', 1);
      }, {
        targets: [t.card('graveyard', and(not(is.creature), not(is.land)), 'carta alvo que não seja de criatura nem terreno no seu cemitério')],
        text: 'No início da sua etapa final, exile a carta alvo que não seja de criatura nem de terreno do seu cemitério. Crie uma ficha de criatura Spirit vermelha e branca 3/2.',
      }),
      activated('{1}{R}{W}, {T}, Sacrifice a Spirit', function* (c) {
        const id = tgt(c);
        // rulings 1, 2, 4: sem pagar o custo de mana (X = 0), no tempo normal da carta
        if (id !== null) allowPlay(c.g, c.you, c.source, [id], { kind: 'endOfTurn' }, { free: true, spellsOnly: true, bottomInstead: true });
      }, {
        // ruling 5: só cartas exiladas pela habilidade ligada
        targets: [t.card('exile', (c, id) => (c.g.state.objects[c.source]?.linked[CHAVE] ?? []).includes(id), 'carta alvo exilada com Quintorius')],
        text: '{1}{R}{W}, {T}, Sacrifique um Spirit: Escolha a carta alvo exilada com Quintorius. Você pode conjurá-la neste turno sem pagar o custo de mana. Se essa mágica fosse para um cemitério, coloque-a no fundo do grimório do dono.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3b — sem pagar o custo de mana, X é 0',
    2: 'regra geral: CR 118.9a — sem custo alternativo; custos adicionais podem ser pagos',
    3: 'regra geral: CR 608.2b — alvo ilegal, nada acontece (nem a ficha)',
    4: 'regra geral: CR 307.1 — respeita o tempo da carta',
    5: 'teste: só cartas exiladas pela habilidade ligada; a mágica vai para o fundo do grimório',
  },
});
