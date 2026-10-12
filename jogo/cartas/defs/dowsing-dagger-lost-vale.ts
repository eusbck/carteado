// Dowsing Dagger // Lost Vale
// Frente — When this Equipment enters, target opponent creates two 0/2 green Plant creature tokens with defender.
// Equipped creature gets +2/+1.
// Whenever equipped creature deals combat damage to a player, you may transform this Equipment.
// Equip {2}
// Verso — (Transforms from Dowsing Dagger.) {T}: Add three mana of any one color.
import { attachedGets, createTokens, defineCard, equip, etb, mana, t, tgtPlayer, transformFrom, triggered, yesNo } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';
import { anexadaCausaDanoDeCombateAJogador } from '../jin.ts';

export default defineCard({
  name: 'Dowsing Dagger // Lost Vale',
  faces: [
    {
      abilities: [
        etb(function* (c) {
          const p = tgtPlayer(c);
          if (p !== null) yield* createTokens(c.g, p, 'Plant', 2);
        }, { targets: [t.opponent()], text: 'Quando este Equipamento entra, o oponente alvo cria duas fichas de criatura Plant 0/2 verdes com defensor.' }),
        attachedGets(() => [{ k: 'pt', p: 2, t: 1 }], 'A criatura equipada recebe +2/+1.'),
        // ruling 1: atacar não vira o Equipamento: ele normalmente transforma desvirado
        triggered(anexadaCausaDanoDeCombateAJogador(), function* (c) {
          if (c.g.state.objects[c.source]?.face !== 0) return;
          if (yield* yesNo(c.g, c.you, 'Dowsing Dagger: transformar em Lost Vale?')) transformFrom(c.g, c.source, 0);
        }, { text: 'Sempre que a criatura equipada causa dano de combate a um jogador, você pode transformar este Equipamento.' }),
        equip('{2}'),
      ],
    },
    {
      abilities: [
        mana(() => (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((cor) => [cor, cor, cor]), { text: '{T}: Adicione três manas de uma cor qualquer.' }),
      ],
    },
  ],
  rulings: { 1: 'teste: no dano de combate a um jogador pode transformar em Lost Vale, que entra desvirado e gera três manas de uma cor' },
});