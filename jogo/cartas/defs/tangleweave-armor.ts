// Tangleweave Armor
// Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)
// Equipped creature gets +X/+X, where X is the greatest mana value among your commanders.
// Equip {4}
import { attach, attachedGets, createTokens, defineCard, equip, etb, manaValue } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

/** maior valor de mana entre os seus comandantes, onde quer que estejam, com as características atuais (ruling 1) */
function maiorComandante(g: G, p: PlayerId): number {
  const s = g.state;
  const cartas = s.players[p].commanders;
  if (!cartas.length) return 0;
  let m = 0;
  for (const o of Object.values(s.objects)) {
    if (o.card === null || !cartas.includes(o.card) || o.isCopy) continue;
    m = Math.max(m, manaValue(g, o.id));
  }
  return m;
}

export default defineCard({
  name: 'Tangleweave Armor',
  faces: [{
    abilities: [
      // CR 702.92a: a ficha entra 0/0 e o Equipamento é preso antes das ações de estado (ruling 2)
      etb(function* (c) {
        const [germe] = yield* createTokens(c.g, c.you, 'Phyrexian Germ', 1);
        if (germe !== undefined && c.g.state.objects[c.source]?.zone === 'battlefield') attach(c.g, c.source, germe);
      }, { kw: 'living weapon', text: 'Arma viva: cria uma ficha de criatura Phyrexian Germ preta 0/0 e anexa este Equipamento a ela.' }),
      attachedGets((c) => { const n = maiorComandante(c.g, c.you); return [{ k: 'pt', p: n, t: n }]; },
        'A criatura equipada recebe +X/+X, em que X é o maior valor de mana entre os seus comandantes.'),
      equip('{4}'),
    ],
  }],
  rulings: {
    1: 'teste: a Germ recebe +X/+X com X o valor de mana do seu comandante, esteja ele onde estiver',
    2: 'teste: a Germ recebe +X/+X com X o valor de mana do seu comandante, esteja ele onde estiver',
    3: 'teste: reequipada em outra criatura, a Germ sem o bônus morre',
    4: 'regra geral: CR 301.5 — destruir a criatura não destrói o Equipamento (motor/sba.ts)',
    5: 'regra geral: CR 704.5f — Germs a mais (Doubling Season) ficam 0/0 e morrem nas ações de estado',
  },
});
