// Animate Dead
// Enchant creature card in a graveyard
// When this Aura enters, if it's on the battlefield, it loses "enchant creature card in a graveyard" and gains "enchant
// creature put onto the battlefield with this Aura." Return enchanted creature card to the battlefield under your control
// and attach this Aura to it. When this Aura leaves the battlefield, that creature's controller sacrifices it.
// Enchanted creature gets -1/-0.
import { attach, attachedGets, defineCard, etb, is, lkiObj, on, putOntoBattlefield, sacrifice, t, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Animate Dead',
  faces: [{
    // ruling 2: mira uma carta de criatura em qualquer cemitério; ruling 5: resistência a magia e proteção só valem no campo
    enchant: t.card('graveyard', is.creature, 'carta de criatura num cemitério', 'any'),
    abilities: [
      etb(function* (c) {
        const s = c.g.state;
        const eu = s.objects[c.source];
        const carta = eu?.attachedTo;
        // ruling 3: fora do campo, nada acontece
        if (!eu || eu.zone !== 'battlefield' || carta == null || s.objects[carta]?.zone !== 'graveyard') return;
        const [nova] = yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
        if (nova === undefined) return;
        // a Aura passa a encantar só a criatura posta no campo com ela (ruling 4)
        eu.data.enchantOverride = nova;
        // ruling 1: se não puder ser presa (proteção contra preto), a ação de estado põe a Aura no cemitério e a criatura é sacrificada
        if (!attach(c.g, c.source, nova)) { eu.attachedTo = null; c.g.bump(); }
      }, { text: 'Quando esta Aura entra, se estiver no campo, devolva a carta de criatura encantada ao campo sob seu controle e prenda esta Aura a ela.' }),
      triggered(on.selfLeaves(), function* (c) {
        const nova = lkiObj(c.g, c.source)?.data.enchantOverride as ObjId | undefined;
        if (nova !== undefined && c.g.state.objects[nova]?.zone === 'battlefield') yield* sacrifice(c.g, [nova]);
      }, { text: 'Quando esta Aura sai do campo, o controlador da criatura a sacrifica.' }),
      attachedGets(() => [{ k: 'pt', p: -1, t: 0 }], 'A criatura encantada recebe -1/-0.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 303.4d, 704.5m — sem poder prender, a Aura vai ao cemitério e o gatilho de saída sacrifica a criatura',
    2: 'teste: a Aura mira a carta no cemitério e volta presa à criatura; ao sair, a criatura é sacrificada',
    3: 'regra geral: CR 603.4 — se a Aura já saiu, nada acontece',
    4: 'regra geral: CR 303.4 — depois disso, só pode encantar essa criatura (motor/actions.ts)',
    5: 'regra geral: CR 702.11, 702.16 — resistência a magia e proteção só valem no campo',
  },
});
