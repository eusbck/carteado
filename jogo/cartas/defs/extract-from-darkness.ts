// Extract from Darkness
// Each player mills two cards. Then you put a creature card from a graveyard onto the battlefield under your control.
import { chooseItems, defineCard, isCreature, mill, nameOf, objItem, putOntoBattlefield } from '../../motor/api.ts';

export default defineCard({
  name: 'Extract from Darkness',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        for (const p of c.g.apnap()) yield* mill(c.g, p, 2);
        // ruling 1: sem alvo; escolhida na resolução entre todos os cemitérios, inclusive o que acabou de ser moído
        const cartas = c.g.playersInGame().flatMap((p) => s.zones.graveyard[p].filter((id) => isCreature(c.g, id)));
        if (!cartas.length) return;
        const [esc] = cartas.length === 1 ? [String(cartas[0])] : yield* chooseItems(c.g, c.you, 'Extract from Darkness: escolha a carta de criatura que vai para o campo sob o seu controle', cartas.map((id) => objItem(c.g, id, `${nameOf(c.g, id)} (cemitério de ${s.players[s.objects[id].owner].name})`)), 1, 1);
        yield* putOntoBattlefield(c.g, [{ id: Number(esc), controller: c.you }], 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: cada jogador moi duas cartas e você põe no campo uma criatura de qualquer cemitério, inclusive uma recém-moída',
  },
});
