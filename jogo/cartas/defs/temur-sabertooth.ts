// Temur Sabertooth
// {1}{G}: You may return another creature you control to its owner's hand. If you do, this creature gains indestructible
// until end of turn.
import { activated, defineCard, untilEndOfTurn } from '../../motor/api.ts';
import { devolveCriatura } from '../gatos.ts';

export default defineCard({
  name: 'Temur Sabertooth',
  faces: [{
    abilities: [
      // ruling 1: sem alvo; você decide se devolve e qual criatura na resolução
      activated('{1}{G}', function* (c) {
        const devolvida = yield* devolveCriatura(c, 'Temur Sabertooth', (id) => id !== c.source, true);
        if (devolvida !== null && c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'indestructible' }]);
      }, { text: '{1}{G}: Você pode devolver outra criatura que você controla para a mão do dono. Se fizer isso, esta criatura ganha indestrutível até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: devolvendo outra criatura sua, ganha indestrutível; sem devolver, não ganha',
  },
});
