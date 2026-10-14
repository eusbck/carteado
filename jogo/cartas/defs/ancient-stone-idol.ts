// Ancient Stone Idol
// Flash
// This spell costs {1} less to cast for each attacking creature.
// Trample
// When this creature dies, create a 6/12 colorless Construct artifact creature token with trample.
import { createTokens, defineCard, keywords, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ancient Stone Idol',
  faces: [{
    // ruling 1: conta todas as criaturas atacantes, de qualquer jogador; ruling 3: o custo é travado antes de pagar (CR 601.2f)
    selfCost: (c) => ({ reduce: (c.g.state.combat?.attackers ?? []).filter((a) => !a.removed && !!c.g.state.objects[a.id]).length }),
    abilities: [
      ...keywords('flash', 'trample'),
      triggered(on.selfDies(), function* (c) { yield* createTokens(c.g, c.you, 'Construct 6/12', 1); }, { text: 'Quando esta criatura morre, crie uma ficha de criatura artefato Construct incolor 6/12 com atropelar.' }),
    ],
  }],
  rulings: {
    1: 'teste: custa {1} a menos para cada criatura atacante, inclusive as do oponente',
    2: 'regra geral: CR 601.2f — a redução só tira mana genérica e pode levar o custo a {0}',
    3: 'regra geral: CR 601.2f — o custo total é travado antes do pagamento',
  },
});
