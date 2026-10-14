// Rhonas the Indomitable
// Deathtouch, indestructible
// Rhonas can't attack or block unless you control another creature with power 4 or greater.
// {2}{G}: Another target creature gets +2/+0 and gains trample until end of turn.
import { activated, controlledBy, defineCard, is, isCreature, keywords, power, staticAbility, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import type { SCtx } from '../../motor/api.ts';

/** "você controla outra criatura com força 4 ou mais" */
function outraForte(c: SCtx): boolean {
  return controlledBy(c.g, c.you, (id) => id !== c.source && isCreature(c.g, id) && power(c.g, id) >= 4).length > 0;
}

export default defineCard({
  name: 'Rhonas the Indomitable',
  faces: [{
    abilities: [
      ...keywords('deathtouch', 'indestructible'),
      // restrições de ataque e bloqueio (CR 508.1c, 509.1b): só conferidas na declaração (ruling 1); a outra criatura
      // não precisa atacar nem bloquear (ruling 2)
      staticAbility({
        rules: {
          canAttack: (c, atacante) => atacante !== c.source || outraForte(c),
          canBlock: (c, bloqueador) => bloqueador !== c.source || outraForte(c),
        },
        text: 'Rhonas não pode atacar nem bloquear a menos que você controle outra criatura com força 4 ou mais.',
      }),
      activated('{2}{G}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: 2, t: 0 }, { k: 'addKeyword', kw: 'trample' }]);
      }, { targets: [t.creature(is.other, 'outra criatura alvo')], text: '{2}{G}: Outra criatura alvo recebe +2/+0 e ganha atropelar até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 508.1c, 509.1b — as restrições só valem na declaração; depois disso Rhonas continua no combate (motor/combat.ts)',
    2: 'teste: com outra criatura de força 4 ou mais, Rhonas ataca sozinho',
  },
});
