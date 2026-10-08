// Sheltered by Ghosts
// Enchant creature you control
// When this Aura enters, exile target nonland permanent an opponent controls until this Aura leaves the battlefield.
// Enchanted creature gets +1/+0 and has lifelink and ward {2}.
import { and, attachedGets, defineCard, etb, exile, is, lkiObj, on, putOntoBattlefield, t, tgt, triggered, wardGranted } from '../../motor/api.ts';

const CHAVE = 'abrigo';

export default defineCard({
  name: 'Sheltered by Ghosts',
  faces: [{
    enchant: t.creature(is.yours, 'criatura que você controla'),
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        // ruling 1: se a Aura já saiu, nada é exilado (CR 610.3c)
        if (id === null || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, {
        targets: [t.nonlandPermanent(and(is.nonland, is.opponents), 'permanente não terreno alvo que um oponente controla')],
        text: 'Quando esta Aura entra, exile o permanente não terreno alvo que um oponente controla até esta Aura sair do campo.',
      }),
      triggered(on.selfLeaves(), function* (c) {
        const exiladas = (lkiObj(c.g, c.source)?.linked[CHAVE] ?? []).filter((id) => c.g.state.objects[id]?.zone === 'exile');
        // rulings 2-3: volta como objeto novo; ficha exilada deixou de existir
        if (exiladas.length) yield* putOntoBattlefield(c.g, exiladas.map((id) => ({ id, controller: c.g.state.objects[id].owner })), 'effect');
      }, { text: 'Quando esta Aura sai do campo, a carta exilada volta ao campo.' }),
      attachedGets(() => [
        { k: 'pt', p: 1, t: 0 }, { k: 'addKeyword', kw: 'lifelink' }, { k: 'addKeyword', kw: 'ward', param: '{2}' }, { k: 'addAbility', id: wardGranted('{2}') },
      ], 'A criatura encantada recebe +1/+0 e tem vínculo com a vida e resguardo {2}.'),
    ],
  }],
  rulings: {
    1: 'teste: se a Aura já saiu, nada é exilado',
    2: 'teste: Auras do exilado vão para o cemitério; ele volta como objeto novo',
    3: 'regra geral: CR 111.8 — ficha exilada deixa de existir e não volta',
  },
});
