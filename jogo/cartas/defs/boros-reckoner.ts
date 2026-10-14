// Boros Reckoner
// Whenever this creature is dealt damage, it deals that much damage to any target.
// {R/W}: This creature gains first strike until end of turn.
import { activated, dealDamage, defineCard, on, t, tgtRef, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Boros Reckoner',
  faces: [{
    abilities: [
      // ruling 3: dano de várias fontes ao mesmo tempo dispara uma vez só, com o total (CR 603.2c)
      triggered(on.batch((evs, c) => {
        const n = evs.reduce((s, e) => s + (e.type === 'damage' && e.target.kind === 'obj' && e.target.id === c.source ? e.amount : 0), 0);
        return n > 0 ? { n } : false;
      }), function* (c) {
        const alvo = tgtRef(c);
        // ruling 1: dispara mesmo com dano letal; a fonte do dano novo é ela, pela última informação (CR 608.2h)
        if (alvo) dealDamage(c.g, [{ source: c.source, target: alvo, amount: c.event.n as number, combat: false }]);
      }, { targets: [t.any()], text: 'Sempre que esta criatura recebe dano, ela causa essa quantidade de dano a qualquer alvo.' }),
      activated('{R/W}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'first strike' }]);
      }, { text: '{R/W}: Esta criatura ganha primeiro golpe até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: bloqueada por uma 7/7, recebe dano letal e mesmo assim causa 7 de dano ao alvo; esse dano não é de combate',
    2: 'teste: bloqueada por uma 7/7, recebe dano letal e mesmo assim causa 7 de dano ao alvo; esse dano não é de combate',
    3: 'teste: dano de duas fontes ao mesmo tempo dispara uma vez só, com o total',
  },
});
