// Sword of Feast and Famine
// Equipped creature gets +2/+2 and has protection from black and from green.
// Whenever equipped creature deals combat damage to a player, that player discards a card and you untap all lands you
// control.
// Equip {2}
import { attachedGets, controllerOf, defineCard, discard, equip, isLand, triggered, untap } from '../../motor/api.ts';
import { anexadaCausaDanoDeCombateAJogador } from '../jin.ts';

export default defineCard({
  name: 'Sword of Feast and Famine',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'protection', param: 'color:B' }, { k: 'addKeyword', kw: 'protection', param: 'color:G' }], 'A criatura equipada recebe +2/+2 e tem proteção contra o preto e contra o verde.'),
      triggered(anexadaCausaDanoDeCombateAJogador(), function* (c) {
        yield* discard(c.g, c.event.jogador as number, 1);
        // ruling 1: os terrenos desviram mesmo que o jogador não tenha carta para descartar
        for (const id of c.g.state.zones.battlefield) if (isLand(c.g, id) && controllerOf(c.g, id) === c.you) untap(c.g, id);
      }, { text: 'Sempre que a criatura equipada causa dano de combate a um jogador, esse jogador descarta uma carta e você desvira todos os terrenos que você controla.' }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'teste: o jogador descarta e os seus terrenos desviram, mesmo que ele não tenha carta na mão',
    2: 'regra geral: CR 500.5 — a mana gerada durante o gatilho se perde no fim da etapa se não for gasta (motor/turn.ts)',
  },
});