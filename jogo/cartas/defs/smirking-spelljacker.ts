// Smirking Spelljacker
// Flash
// Flying
// When this creature enters, exile target spell an opponent controls.
// Whenever this creature attacks, if a card is exiled with it, you may cast the exiled card without paying its mana cost.
import { defineCard, etb, exile, keywords, linkedExiled, on, t, tgt, triggered } from '../../motor/api.ts';
import { conjuraDentreGratis, ROUBO } from '../roubo.ts';

const CHAVE = 'spelljacker';

export default defineCard({
  name: 'Smirking Spelljacker',
  faces: [{
    abilities: [
      ...keywords('flash', 'flying'),
      etb(function* (c) {
        const id = tgt(c);
        // ruling 1: exilar não é anular; vale também para mágica que não pode ser anulada
        if (id !== null) yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, {
        targets: [t.spell((c, id) => c.g.isOpponent(c.you, c.g.state.objects[id]?.stack?.controller ?? c.you), 'mágica alvo que um oponente controla')],
        text: 'Quando esta criatura entra, exile a mágica alvo que um oponente controla.',
      }),
      triggered(on.selfAttacks(), function* (c) {
        // ruling 2: durante a resolução, ignorando o tempo de feitiço; ruling 5: conjurada, deixa de estar exilada com ela
        yield* conjuraDentreGratis(c, linkedExiled(c.g, c.source, CHAVE), { rotulo: 'Smirking Spelljacker', varias: false });
      }, {
        // CR 603.4: condição interveniente
        condition: (c) => linkedExiled(c.g, c.source, CHAVE).length > 0,
        text: 'Sempre que esta criatura ataca, se houver uma carta exilada com ela, você pode conjurar a carta exilada sem pagar o custo de mana.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: exila a mágica de um oponente, mesmo uma que não pode ser anulada',
    2: ROUBO.durante,
    3: ROUBO.gratisAlternativo,
    4: ROUBO.gratisX,
    5: 'teste: ao atacar, conjura a carta exilada de graça; depois ela não está mais exilada com a criatura',
  },
});
