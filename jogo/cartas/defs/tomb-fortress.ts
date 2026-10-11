// Tomb Fortress
// This land enters tapped.
// {T}: Add {B}.
// {2}{B}{B}{B}, {T}, Exile this land: Mill four cards, then return a creature card from your graveyard to the
// battlefield. Activate only as a sorcery.
import { activated, chooseItems, defineCard, isCreature, land, mana, mill, nameOf, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Tomb Fortress',
  faces: [{
    abilities: [
      land.tapped(),
      mana('B'),
      activated('{2}{B}{B}{B}, {T}, Exile this land', function* (c) {
        yield* mill(c.g, c.you, 4);
        // ruling 1: qualquer carta de criatura do cemitério, moída agora ou não; sem alvo, escolhida na resolução
        const s = c.g.state;
        const cands = s.zones.graveyard[c.you].filter((id) => isCreature(c.g, id));
        if (cands.length === 0) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Tomb Fortress: escolha uma carta de criatura do seu cemitério para voltar ao campo',
          cands.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), 1, 1);
        yield* putOntoBattlefield(c.g, [{ id: Number(esc), controller: c.you }], 'effect');
      }, { timing: 'sorcery', text: '{2}{B}{B}{B}, {T}, Exile este terreno: Coloque as quatro cartas do topo do seu grimório no cemitério, depois devolva uma carta de criatura do seu cemitério para o campo. Ative apenas como um feitiço.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode devolver uma criatura que já estava no cemitério antes de moer',
  },
});
