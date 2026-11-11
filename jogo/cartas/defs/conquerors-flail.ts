// Conqueror's Flail
// Equipped creature gets +1/+1 for each color among permanents you control.
// As long as this Equipment is attached to a creature, your opponents can't cast spells during your turn.
// Equip {2}
import { attachedGets, chars, controlledBy, defineCard, equip, isCreature, staticAbility, type G } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

// ruling 1: só as cinco cores contam (multicolorido, artefato e incolor não são cores): no máximo +5/+5
function cores(g: G, p: PlayerId): number {
  const s = new Set<string>();
  for (const id of controlledBy(g, p, () => true)) for (const cor of chars(g, id).colors) s.add(cor);
  return ['W', 'U', 'B', 'R', 'G'].filter((x) => s.has(x)).length;
}

export default defineCard({
  name: "Conqueror's Flail",
  faces: [{
    abilities: [
      // ruling 3: o bônus acompanha a contagem a cada momento
      attachedGets((c) => { const n = cores(c.g, c.you); return [{ k: 'pt', p: n, t: n }]; }, 'A criatura equipada recebe +1/+1 para cada cor entre as permanentes que você controla.'),
      staticAbility({
        rules: {
          cantCastSpells: (c, p) => {
            const alvo = c.g.state.objects[c.source]?.attachedTo;
            if (alvo === null || alvo === undefined || !c.g.state.objects[alvo] || !isCreature(c.g, alvo)) return false;
            return c.g.state.turn.active === c.you && c.g.opponents(c.you).includes(p);
          },
        },
        text: 'Enquanto este Equipamento estiver anexado a uma criatura, seus oponentes não podem conjurar mágicas durante o seu turno.',
      }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: +1/+1 por cor entre as permanentes que você controla, só as cinco cores (no máximo +5/+5)',
    2: 'teste: reequipar de uma criatura para outra não abre janela para os oponentes conjurarem',
    3: 'teste: o bônus muda com as cores e a criatura morre se o dano marcado passa a ser letal',
  },
});
