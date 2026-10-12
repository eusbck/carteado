// Shadowspear
// Equipped creature gets +1/+1 and has trample and lifelink.
// {1}: Permanents your opponents control lose hexproof and indestructible until end of turn.
// Equip {2}
import { activated, attachedGets, controllerOf, defineCard, equip, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Shadowspear',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'trample' }, { k: 'addKeyword', kw: 'lifelink' }], 'A criatura equipada recebe +1/+1 e tem atropelar e vínculo com a vida.'),
      // ruling 2: vale para as permanentes que os oponentes controlam quando a habilidade resolve; ruling 3: não
      // precisa estar equipada
      activated('{1}', function* (c) {
        const ids = c.g.state.zones.battlefield.filter((id) => c.g.isOpponent(c.you, controllerOf(c.g, id)));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'loseKeyword', kw: 'hexproof' }, { k: 'loseKeyword', kw: 'indestructible' }]);
      }, { text: '{1}: As permanentes que os seus oponentes controlam perdem resistência a magia e indestrutível até o fim do turno.' }),
      equip('{2}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 120.6 — o dano fica marcado até a limpeza: sem indestrutível, o dano já recebido pode destruir a criatura (motor/sba.ts)',
    2: 'regra geral: CR 611.2c — só perdem as habilidades as permanentes que já eram dos oponentes na resolução, e só as que já tinham (motor/layers)',
    3: 'teste: {1}: as permanentes dos oponentes perdem resistência a magia e indestrutível, mesmo sem a lança equipada',
  },
});