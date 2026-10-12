// Scarlet Witch, Chaotic Avenger
// Flying
// Whenever Scarlet Witch deals combat damage to a player, look at the top two cards of your library, then exile them
// face down. Then you may cast a Hero or noncreature spell from among cards exiled with Scarlet Witch without paying
// its mana cost.
import { chooseItems, defineCard, exile, isCreature, isLand, keyword, linkedExiled, mayCastFree, nameOf, objItem, on, triggered } from '../../motor/api.ts';
import { ehHeroi } from '../vingadores.ts';

const CHAVE = 'scarlet';

export default defineCard({
  name: 'Scarlet Witch, Chaotic Avenger',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 2);
        if (topo.length && s.objects[c.source]?.zone === 'battlefield') yield* exile(c.g, topo, { faceDown: true, linkTo: { obj: c.source, key: CHAVE } });
        else if (topo.length) yield* exile(c.g, topo, { faceDown: true });
        // entre todas as cartas exiladas com ela, não só as duas de agora
        const cartas = linkedExiled(c.g, c.source, CHAVE).filter((id) => s.objects[id]?.zone === 'exile' && !isLand(c.g, id) && (ehHeroi(c.g, id) || !isCreature(c.g, id)));
        if (!cartas.length) return;
        const esc = yield* chooseItems(c.g, c.you, 'Scarlet Witch: você pode conjurar sem pagar uma mágica de Hero ou que não é de criatura entre as exiladas', cartas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (esc.length) yield* mayCastFree(c.g, c.you, Number(esc[0]));
      }, { text: 'Sempre que Scarlet Witch causa dano de combate a um jogador, olhe as duas cartas do topo do seu grimório e exile-as viradas para baixo. Depois, você pode conjurar uma mágica de Hero ou que não é de criatura entre as cartas exiladas com Scarlet Witch sem pagar o custo de mana.' }),
    ],
  }],
  rulings: {},
});