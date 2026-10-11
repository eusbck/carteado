// Thief of Sanity
// Flying
// Whenever this creature deals combat damage to a player, look at the top three cards of that player's library, exile
// one of them face down, then put the rest into their graveyard. You may cast that card for as long as it remains
// exiled, and mana of any type can be spent to cast that spell.
import { allowPlay, chooseItems, defineCard, keyword, moveObjects, nameOf, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Thief of Sanity',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        const p = c.event.player as PlayerId;
        const topo = s.zones.library[p].slice(0, 3);
        if (!topo.length) return;
        const [esc] = yield* chooseItems(c.g, c.you, `Thief of Sanity: escolha a carta de ${s.players[p].name} para exilar virada para baixo (as outras vão para o cemitério)`,
          topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), 1, 1);
        const escolhida = Number(esc);
        // virada para baixo; só você pode olhá-la (CR 406.3)
        const [ex] = yield* moveObjects(c.g, [{ id: escolhida, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'exile');
        const resto = topo.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library');
        if (resto.length) yield* moveObjects(c.g, resto.map((id) => ({ id, to: 'graveyard' as const })), 'effect');
        if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') return;
        // rulings 1-3: só conjurar (terreno não), no tempo normal da carta; a permissão é de quem controlava o gatilho e
        // continua valendo se Thief of Sanity sair do campo ou mudar de controlador
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' }, { anyType: true, spellsOnly: true });
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, olhe as três cartas do topo do grimório desse jogador, exile uma delas virada para baixo e coloque o resto no cemitério dele. Você pode conjurar essa carta enquanto ela continuar exilada, e mana de qualquer tipo pode ser gasta para conjurá-la.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 117.1a — a permissão não muda o momento em que a carta pode ser conjurada (motor/priority.ts)',
    2: 'teste: um terreno exilado assim não pode ser jogado',
    3: 'teste: você conjura a carta exilada com mana de qualquer tipo, mesmo depois de Thief of Sanity sair do campo',
    4: 'regra geral: CR 400.7 — conjurada, a carta sai do exílio e a permissão não vale para o objeto novo',
    5: 'regra geral: CR 800.4a — quando você sai da partida, o que você controla de outros donos é exilado (motor/sba.ts leaveGame)',
  },
});
