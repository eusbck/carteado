// Emeria, the Sky Ruin
// This land enters tapped.
// At the beginning of your upkeep, if you control seven or more Plains, you may return target creature card from
// your graveyard to the battlefield.
// {T}: Add {W}.
import { chars, controlledBy, defineCard, is, land, mana, on, putOntoBattlefield, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

const setePlains = (c: SCtx) => controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.includes('Plains')).length >= 7;

export default defineCard({
  name: 'Emeria, the Sky Ruin',
  faces: [{
    abilities: [
      land.tapped(),
      // CR 603.4: cláusula "se" interveniente, checada ao disparar e ao resolver
      triggered(on.upkeep('you'), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (yield* yesNo(c.g, c.you, 'Devolver a criatura do cemitério para o campo?')) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'return');
      }, { condition: setePlains, targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')], text: 'No início da sua manutenção, se você controla sete ou mais Plains, você pode devolver a carta de criatura alvo do seu cemitério para o campo.' }),
      mana('W'),
    ],
  }],
  rulings: { 1: 'teste: CR 603.4: com menos de sete Plains não dispara' },
});
