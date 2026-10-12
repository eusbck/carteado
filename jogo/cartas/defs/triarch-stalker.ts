// Triarch Stalker
// Targeting Relay — At the beginning of combat on your turn, choose an opponent.
// Creatures attacking the last chosen player have menace.
import { anthem, chooseItems, defineCard, on, playerItem, triggered } from '../../motor/api.ts';

const CHAVE = 'triarchStalker';

export default defineCard({
  name: 'Triarch Stalker',
  faces: [{
    abilities: [
      triggered(on.beginCombat('you'), function* (c) {
        const o = c.g.state.objects[c.source];
        const oponentes = c.g.opponents(c.you);
        if (!o || o.zone !== 'battlefield' || !oponentes.length) return;
        let escolhido = oponentes[0];
        if (oponentes.length > 1) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Triarch Stalker: escolha um oponente', oponentes.map((p) => playerItem(c.g, p)), 1, 1);
          escolhido = Number(String(esc).replace(/^p/, ''));
        }
        o.data[CHAVE] = escolhido;
        c.g.bump();
      }, { text: 'Targeting Relay — No início do combate no seu turno, escolha um oponente.' }),
      // vale para as criaturas de qualquer jogador que estejam atacando o último jogador escolhido
      anthem((c, id) => {
        const alvo = c.g.state.objects[c.source]?.data[CHAVE] as number | undefined;
        if (alvo === undefined) return false;
        return !!c.g.state.combat?.attackers.some((a) => a.id === id && !a.removed && a.target.kind === 'player' && a.target.id === alvo);
      }, () => [{ k: 'addKeyword', kw: 'menace' }], 'As criaturas que estão atacando o último jogador escolhido têm ameaçar.'),
    ],
  }],
  rulings: {},
});