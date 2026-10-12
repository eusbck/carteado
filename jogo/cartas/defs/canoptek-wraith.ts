// Canoptek Wraith
// Wraith Form — This creature can't be blocked.
// Transdimensional Scout — When this creature deals combat damage to a player, you may pay {3} and sacrifice it. If you
// do, choose a land you control. Then search your library for up to two basic land cards which have the same name as the
// chosen land, put them onto the battlefield tapped, then shuffle.
import { chooseItems, controllerOf, defineCard, isBasicLand, isLand, mayPay, nameOf, objItem, on, sacrifice, searchTo, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Canoptek Wraith',
  faces: [{
    abilities: [
      staticAbility({ rules: { canBeBlockedBy: (c, atacante) => atacante !== c.source }, text: 'Wraith Form — Esta criatura não pode ser bloqueada.' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        if (s.objects[c.source]?.zone !== 'battlefield') return;
        if (!(yield* mayPay(c, c.you, '{3}', 'sacrificar Canoptek Wraith e buscar até dois terrenos básicos'))) return;
        const sacrificadas = yield* sacrifice(c.g, [c.source]);
        if (!sacrificadas.length) return;
        const terrenos = s.zones.battlefield.filter((id) => isLand(c.g, id) && controllerOf(c.g, id) === c.you);
        if (!terrenos.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, 'Canoptek Wraith: escolha um terreno que você controla', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        const nome = nameOf(c.g, Number(esc));
        // ruling 1: os dois terrenos buscados têm o mesmo nome do terreno escolhido
        yield* searchTo(c, c.you, (id) => isBasicLand(c.g, id) && nameOf(c.g, id) === nome, 2, 'battlefield', { tapped: true, prompt: `Procure até duas cartas de terreno básico chamadas ${nome}` });
      }, { text: 'Transdimensional Scout — Quando esta criatura causa dano de combate a um jogador, você pode pagar {3} e sacrificá-la. Se fizer isso, escolha um terreno que você controla. Depois, procure no seu grimório até duas cartas de terreno básico com o mesmo nome do terreno escolhido, coloque-as no campo de batalha viradas e embaralhe.' }),
    ],
  }],
  rulings: { 1: 'teste: pagando {3} e sacrificando, busca até dois terrenos básicos com o nome do terreno escolhido, virados' },
});