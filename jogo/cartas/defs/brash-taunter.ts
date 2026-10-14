// Brash Taunter
// Indestructible
// Whenever this creature is dealt damage, it deals that much damage to target opponent.
// {2}{R}, {T}: This creature fights another target creature.
import { activated, dealDamage, defineCard, is, keywords, on, t, tgt, tgtPlayer, triggered } from '../../motor/api.ts';
import { luta } from '../wakanda.ts';

export default defineCard({
  name: 'Brash Taunter',
  faces: [{
    abilities: [
      ...keywords('indestructible'),
      // ruling 1: a quantidade é o dano recebido, mesmo maior que a resistência; lote simultâneo = um disparo
      triggered(on.batch((evs, c) => {
        const n = evs.reduce((s, e) => s + (e.type === 'damage' && e.target.kind === 'obj' && e.target.id === c.source ? e.amount : 0), 0);
        return n > 0 ? { n } : false;
      }), function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: p }, amount: c.event.n as number, combat: false }]);
      }, { targets: [t.opponent()], text: 'Sempre que esta criatura recebe dano, ela causa essa quantidade de dano ao oponente alvo.' }),
      // CR 701.14a; ruling 3: alvo ilegal, a habilidade não resolve; sem o Taunter no campo, ninguém causa dano
      activated('{2}{R}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) luta(c.g, c.source, id);
      }, { targets: [t.creature(is.other, 'outra criatura alvo')], text: '{2}{R}, {T}: Esta criatura luta com outra criatura alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: luta com uma 2/10: recebe 2 e causa 2 ao oponente alvo; continua no campo (indestrutível)',
    2: 'regra geral: CR 704.3 — o jogador com 0 de vida perde antes de o gatilho ir para a pilha',
    3: 'regra geral: CR 608.2b — com o alvo ilegal a habilidade não resolve; luta só acontece com as duas no campo (cartas/wakanda.ts luta)',
  },
});
