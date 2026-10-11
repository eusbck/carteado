// Annie Joins Up
// When Annie Joins Up enters, it deals 5 damage to target creature or planeswalker an opponent controls.
// If a triggered ability of a legendary creature you control triggers, that ability triggers an additional time.
import { chars, controllerOf, dealDamage, defineCard, etb, isCreature, isType, staticAbility, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Annie Joins Up',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 5, combat: false }]);
      }, {
        targets: [t.permanent((c, id) => (isCreature(c.g, id) || isType(c.g, id, 'Planeswalker')) && c.g.isOpponent(c.you, controllerOf(c.g, id)), 'criatura ou planeswalker alvo que um oponente controla')],
        text: 'Quando Annie Joins Up entra, ela causa 5 de dano à criatura ou planeswalker alvo que um oponente controla.',
      }),
      staticAbility({
        rules: {
          // ruling 4: não copia a habilidade, ela dispara de novo; duas Annie somam (três disparos)
          extraTriggers: (c, tr) => {
            if (tr.controller !== c.you) return 0;
            const o = c.g.state.objects[tr.source];
            // ruling 8: a fonte tem de ser criatura lendária sua no momento do disparo (gatilhos de sair usam a última informação)
            const ch = o?.zone === 'battlefield' ? (controllerOf(c.g, tr.source) === c.you ? chars(c.g, tr.source) : null) : c.g.state.lki[tr.source]?.chars ?? null;
            return ch && ch.types.includes('Creature') && ch.supertypes.includes('Legendary') ? 1 : 0;
          },
        },
        text: 'Se uma habilidade desencadeada de uma criatura lendária que você controla disparar, ela dispara uma vez a mais.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.2d — vale para qualquer habilidade desencadeada da criatura lendária (motor/triggers.ts extraTriggers)',
    2: 'regra geral: CR 603.2d — só habilidades desencadeadas disparam de novo; efeitos de substituição não passam por extraTriggers',
    3: 'regra geral: CR 603.2d — "conforme entra" não é habilidade desencadeada e não passa por extraTriggers',
    4: 'teste: a habilidade de uma criatura lendária sua dispara uma vez a mais; a do oponente, não',
    5: 'regra geral: CR 603.2d — cada instância é uma habilidade própria na pilha, com os mesmos dados do evento (motor/triggers.ts)',
    6: 'regra geral: CR 603.2d — cada instância é uma habilidade própria na pilha, com os mesmos dados do evento (motor/triggers.ts)',
    7: 'regra geral: CR 603.2d — a fonte é conferida no momento do disparo (cartas/defs/annie-joins-up.ts)',
    8: 'regra geral: CR 603.2d — a fonte é conferida no momento do disparo (cartas/defs/annie-joins-up.ts)',
  },
});
