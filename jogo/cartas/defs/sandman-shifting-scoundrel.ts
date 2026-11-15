// Sandman, Shifting Scoundrel
// Sandman's power and toughness are each equal to the number of lands you control.
// Sandman can't be blocked by creatures with power 2 or less.
// {3}{G}{G}: Return this card and target land card from your graveyard to the battlefield tapped.
import { activated, defineCard, is, power, putOntoBattlefield, selfGets, staticAbility, t, tgt } from '../../motor/api.ts';
import { terrenosDe } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Sandman, Shifting Scoundrel',
  faces: [{
    abilities: [
      // CR 604.3: a habilidade que define característica funciona em todas as zonas.
      selfGets((c) => {
        const n = terrenosDe(c.g, c.you).length;
        return [{ k: 'setPT', p: n, t: n }];
      }, 'A força e a resistência de Sandman são iguais ao número de terrenos que você controla.', { cda: true }),
      staticAbility({
        rules: { canBeBlockedBy: (c, atacante, bloqueador) => atacante !== c.source || power(c.g, bloqueador) > 2 },
        text: 'Sandman não pode ser bloqueado por criaturas com força 2 ou menos.',
      }),
      // CR 113.6m: a habilidade só funciona no cemitério. Só a carta de terreno é alvo.
      activated('{3}{G}{G}', function* (c) {
        const terreno = tgt(c);
        if (terreno === null) return;
        const ids = [terreno];
        if (c.g.state.objects[c.source]?.zone === 'graveyard') ids.unshift(c.source);
        yield* putOntoBattlefield(c.g, ids.map((id) => ({ id, controller: c.you, tapped: true })), 'effect');
      }, {
        zones: ['graveyard'],
        targets: [t.card('graveyard', is.land, 'carta de terreno alvo do seu cemitério')],
        text: '{3}{G}{G}: Devolva esta carta e a carta de terreno alvo do seu cemitério para o campo de batalha viradas.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: CR 604.3: a força e a resistência também são definidas fora do campo',
    2: 'teste: perder força depois da declaração não desfaz o bloqueio',
  },
});
