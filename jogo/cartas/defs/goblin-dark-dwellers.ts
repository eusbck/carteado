// Goblin Dark-Dwellers
// Menace (This creature can't be blocked except by two or more creatures.)
// When this creature enters, you may cast target instant or sorcery card with mana value 3 or less from your graveyard
// without paying its mana cost. If that spell would be put into your graveyard, exile it instead.
import { and, castSpell, defineCard, etb, is, keyword, nameOf, t, tgt, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Goblin Dark-Dwellers',
  faces: [{
    abilities: [
      keyword('menace'),
      etb(function* (c) {
        const carta = tgt(c);
        // ruling 2: sem conjurar, a carta fica no cemitério
        if (carta === null || c.g.state.objects[carta]?.zone !== 'graveyard') return;
        if (!(yield* yesNo(c.g, c.you, `Goblin Dark-Dwellers: conjurar ${nameOf(c.g, carta)} sem pagar o custo de mana?`))) return;
        // rulings 1, 3-5: conjurada agora, na resolução, sem custos alternativos e com X = 0; se fosse para o seu
        // cemitério (resolvendo ou anulada), é exilada
        yield* castSpell(c.g, c.you, carta, {
          key: 'free', label: 'sem pagar o custo de mana', zone: 'graveyard', free: true, duringResolution: true,
          permission: { key: `dark-dwellers:${carta}`, label: 'Goblin Dark-Dwellers', free: true, exileInstead: true },
        });
      }, {
        targets: [t.card('graveyard', and(is.instantOrSorcery, is.mvAtMost(3)), 'carta instantânea ou de feitiço alvo com valor de mana 3 ou menos no seu cemitério')],
        text: 'Quando esta criatura entra, você pode conjurar a carta instantânea ou de feitiço alvo com valor de mana 3 ou menos do seu cemitério sem pagar o custo de mana. Se essa mágica fosse para o seu cemitério, exile-a em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2g — conjurada durante a resolução, sem as permissões de tempo do tipo (motor/stack.ts castSpell duringResolution)',
    2: 'teste: é opcional: sem conjurar, a carta fica no cemitério',
    3: 'regra geral: CR 118.9 — sem pagar o custo de mana não se combinam custos alternativos; os adicionais continuam (motor/stack.ts)',
    4: 'regra geral: CR 107.3b — X é 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    5: 'teste: ao entrar, conjura de graça uma instantânea ou feitiço de valor 3 ou menos do cemitério, que é exilada',
    6: 'regra geral: CR 614.6 — só a ida para o cemitério é trocada por exílio; indo para outra zona, a carta não é exilada (motor/actions.ts exileInsteadOfGraveyard)',
  },
});
