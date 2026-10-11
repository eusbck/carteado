// Bast, Panther Goddess
// Reach, trample, indestructible
// Bast can't attack or block unless you control three or more creatures.
// Whenever you attack, target attacking creature gets +X/+X until end of turn, where X is the number of creatures you
// control.
import { creaturesOf, defineCard, isAttacking, keywords, on, staticAbility, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Bast, Panther Goddess',
  faces: [{
    abilities: [
      ...keywords('reach', 'trample', 'indestructible'),
      staticAbility({
        rules: {
          canAttack: (c, atacante) => atacante !== c.source || creaturesOf(c.g, c.you).length >= 3,
          canBlock: (c, bloqueador) => bloqueador !== c.source || creaturesOf(c.g, c.you).length >= 3,
        },
        text: 'Bast não pode atacar nem bloquear a menos que você controle três ou mais criaturas.',
      }),
      triggered(on.youAttack(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // X é visto na resolução
        const x = creaturesOf(c.g, c.you).length;
        untilEndOfTurn(c, [id], [{ k: 'pt', p: x, t: x }]);
      }, { targets: [t.creature((c, id) => isAttacking(c.g, id), 'criatura atacante alvo')], text: 'Sempre que você ataca, a criatura atacante alvo recebe +X/+X até o fim do turno, onde X é o número de criaturas que você controla.' }),
    ],
  }],
  rulings: {},
});