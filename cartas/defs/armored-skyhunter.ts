// Armored Skyhunter
// Flying
// Whenever this creature attacks, look at the top six cards of your library. You may put an Aura or Equipment card
// from among them onto the battlefield. If an Equipment is put onto the battlefield this way, you may attach it to a
// creature you control. Put the rest of those cards on the bottom of your library in a random order.
import { attach, chooseItems, creaturesOf, defineCard, enchantCandidates, isSubtype, keyword, nameOf, objItem, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ChoiceItem } from '../../motor/types.ts';

export default defineCard({
  name: 'Armored Skyhunter',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 6);
        if (topo.length === 0) return;
        // ruling 1: Aura sem nada que possa encantar não pode ser escolhida
        const pode = (id: number) => isSubtype(c.g, id, 'Equipment') || (isSubtype(c.g, id, 'Aura') && enchantCandidates(c.g, s.objects[id].def, 0, c.you).length > 0);
        const itens: ChoiceItem[] = topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: !pode(id) }));
        const pick = itens.some((i) => !i.disabled)
          ? yield* chooseItems(c.g, c.you, 'Armored Skyhunter: você pode colocar uma Aura ou um Equipamento no campo', itens, 0, 1)
          : [];
        const escolhida = pick.length ? Number(pick[0]) : null;
        if (escolhida !== null) {
          const equip = isSubtype(c.g, escolhida, 'Equipment');
          const [novo] = yield* putOntoBattlefield(c.g, [{ id: escolhida, controller: c.you }], 'effect');
          if (equip && novo !== undefined) {
            const minhas = creaturesOf(c.g, c.you);
            if (minhas.length) {
              const alvo = yield* chooseItems(c.g, c.you, `Anexar ${nameOf(c.g, novo)} a uma criatura sua?`, minhas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
              if (alvo.length) attach(c.g, novo, Number(alvo[0]));
            }
          }
        }
        // o resto vai para o fundo em ordem aleatória
        const resto = shuffle(s.rng, topo.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      }, { text: 'Sempre que esta criatura ataca, olhe as seis cartas do topo do seu grimório. Você pode colocar uma carta de Aura ou Equipamento dentre elas no campo (um Equipamento pode ser anexado a uma criatura sua). O resto vai para o fundo em ordem aleatória.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 303.4f-g — Aura sem nada que possa encantar fica indisponível na escolha (enchantCandidates) e não entra' },
});
