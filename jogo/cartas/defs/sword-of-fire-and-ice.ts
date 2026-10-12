// Sword of Fire and Ice
// Equipped creature gets +2/+2 and has protection from red and from blue.
// Whenever equipped creature deals combat damage to a player, this Equipment deals 2 damage to any target and you draw a
// card.
// Equip {2}
import { attachedGets, dealDamage, defineCard, draw, equip, t, triggered } from '../../motor/api.ts';
import { anexadaCausaDanoDeCombateAJogador } from '../jin.ts';

export default defineCard({
  name: 'Sword of Fire and Ice',
  faces: [{
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'protection', param: 'color:R' }, { k: 'addKeyword', kw: 'protection', param: 'color:U' }], 'A criatura equipada recebe +2/+2 e tem proteção contra o vermelho e contra o azul.'),
      // ruling 1: com o alvo ilegal na resolução, a habilidade não resolve e você não compra
      triggered(anexadaCausaDanoDeCombateAJogador(), function* (c) {
        const r = c.targets[0]?.[0];
        if (r) dealDamage(c.g, [{ source: c.source, target: r, amount: 2, combat: false }]);
        yield* draw(c.g, c.you, 1);
      }, { targets: [t.any()], text: 'Sempre que a criatura equipada causa dano de combate a um jogador, este Equipamento causa 2 de dano a qualquer alvo e você compra uma carta.' }),
      equip('{2}'),
    ],
  }],
  rulings: { 1: 'regra geral: CR 608.2b — com o alvo ilegal na resolução, a habilidade não resolve e você não compra (motor/stack.ts)' },
});