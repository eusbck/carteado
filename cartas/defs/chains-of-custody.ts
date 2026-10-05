// Chains of Custody
// Enchant creature you control
// When this Aura enters, exile target nonland permanent an opponent controls until this Aura leaves the battlefield.
// Enchanted creature has ward {2}.
import { and, attachedGets, defineCard, etb, exile, is, lkiObj, on, putOntoBattlefield, t, tgt, triggered, wardGranted } from '../../motor/api.ts';

const CHAVE = 'custodia';

export default defineCard({
  name: 'Chains of Custody',
  faces: [{
    enchant: t.creature(is.yours, 'criatura que você controla'),
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        // ruling 3: se a Aura já saiu, nada é exilado (CR 610.3c)
        if (id === null || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, {
        targets: [t.nonlandPermanent(and(is.nonland, is.opponents), 'permanente não terreno alvo que um oponente controla')],
        text: 'Quando esta Aura entra, exile o permanente não terreno alvo que um oponente controla até esta Aura sair do campo.',
      }),
      triggered(on.selfLeaves(), function* (c) {
        const exiladas = (lkiObj(c.g, c.source)?.linked[CHAVE] ?? []).filter((id) => c.g.state.objects[id]?.zone === 'exile');
        // rulings 1-2, 4: ficha deixa de existir; Aura escolhe o que encantar; volta como objeto novo
        if (exiladas.length) yield* putOntoBattlefield(c.g, exiladas.map((id) => ({ id, controller: c.g.state.objects[id].owner })), 'effect');
      }, { text: 'Quando esta Aura sai do campo, a carta exilada volta ao campo.' }),
      attachedGets(() => [{ k: 'addKeyword', kw: 'ward', param: '{2}' }, { k: 'addAbility', id: wardGranted('{2}') }], 'A criatura encantada tem resguardo {2}.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 111.8 — ficha exilada deixa de existir e não volta',
    2: 'regra geral: CR 303.4f — Aura que volta escolhe o que encantar (putOntoBattlefield)',
    3: 'teste: se a Aura já saiu, nada é exilado',
    4: 'regra geral: CR 400.7 — volta como objeto novo',
  },
});
