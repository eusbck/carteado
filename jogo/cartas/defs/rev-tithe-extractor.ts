// Rev, Tithe Extractor
// Whenever you attack, target creature gains deathtouch until end of turn.
// Whenever one or more creatures you control deal combat damage to a player, create a Treasure token, then look at the top
// card of that player's library and exile it face down. You may cast that card for as long as it remains exiled. (A
// Treasure token is an artifact with "{T}, Sacrifice this token: Add one mana of any color.")
import { allowPlay, createTokens, defineCard, isCreature, moveObjects, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';

export default defineCard({
  name: 'Rev, Tithe Extractor',
  faces: [{
    abilities: [
      triggered(on.youAttack(), function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'deathtouch' }]);
      }, { targets: [t.creature()], text: 'Sempre que você ataca, a criatura alvo ganha toque mortífero até o fim do turno.' }),
      // um gatilho por jogador que tomou dano no mesmo lote
      triggered(seusCausamDanoDeCombate((c, id) => isCreature(c.g, id)), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
        const s = c.g.state;
        const p = c.event.jogador as number;
        const topo = s.zones.library[p][0];
        if (topo === undefined) return;
        // virada para baixo; só você pode olhá-la (CR 406.3), mesmo que Rev saia do campo (ruling 1)
        const [ex] = yield* moveObjects(c.g, [{ id: topo, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'exile');
        if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') return;
        // rulings 2 e 3: só conjurar (terreno não), pagando os custos e no tempo normal
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' }, { spellsOnly: true });
      }, { text: 'Sempre que uma ou mais criaturas que você controla causam dano de combate a um jogador, crie uma ficha Treasure, depois olhe a carta do topo do grimório desse jogador e exile-a virada para baixo. Você pode conjurar essa carta enquanto ela continuar exilada.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 406.3 — a permissão de olhar e conjurar é sua e continua mesmo que Rev saia do campo ou mude de controlador (motor/mecanicas.ts allowPlay)',
    2: 'regra geral: CR 305.1 — "conjurar" não permite jogar terrenos (motor/mecanicas.ts allowPlay, spellsOnly)',
    3: 'teste: no dano de combate cria um Treasure e exila virada para baixo a carta do topo do grimório do jogador, que você pode conjurar pagando o custo',
    4: 'regra geral: CR 800.4a — se você sair da partida, as cartas exiladas viradas para baixo ficam assim (motor/game-context.ts)',
  },
});