// Creative Technique
// Demonstrate (When you cast this spell, you may copy it. If you do, choose an opponent to also copy it.)
// Shuffle your library, then reveal cards from the top of it until you reveal a nonland card. Exile that card and put
// the rest on the bottom of your library in a random order. You may cast the exiled card without paying its mana cost.
import { defineCard, demonstrate, exile, isLand, mayCastFree, nameOf, shuffleLibrary } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';

export default defineCard({
  name: 'Creative Technique',
  faces: [{
    abilities: [demonstrate()],
    spell: {
      *effect(c) {
        const s = c.g.state;
        shuffleLibrary(c.g, c.you);
        const lib = s.zones.library[c.you];
        const i = lib.findIndex((id) => !isLand(c.g, id));
        const reveladas = i < 0 ? [...lib] : lib.slice(0, i + 1);
        c.g.log(`${s.players[c.you].name} revela ${reveladas.map((id) => nameOf(c.g, id)).join(', ') || 'nada'}.`, { rule: '701.20' });
        let exilada: number | null = null;
        if (i >= 0) [exilada] = yield* exile(c.g, [lib[i]]);
        const resto = shuffle(s.rng, reveladas.filter((id) => s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
        if (exilada !== null && exilada !== undefined) yield* mayCastFree(c.g, c.you, exilada);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 707.10c — as cópias podem ter novos alvos, escolhidos ao serem criadas',
    2: 'teste: sem copiar, ninguém copia',
    3: 'teste: a cópia do oponente resolve primeiro',
    4: 'regra geral: CR 702.144a — a escolha é feita na resolução do gatilho',
    5: 'regra geral: CR 702.144a — o oponente escolhido copia logo em seguida',
  },
});
