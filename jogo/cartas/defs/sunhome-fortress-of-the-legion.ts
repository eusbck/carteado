// Sunhome, Fortress of the Legion
// {T}: Add {C}.
// {2}{R}{W}, {T}: Target creature gains double strike until end of turn.
import { activated, defineCard, mana, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Sunhome, Fortress of the Legion',
  faces: [{
    abilities: [
      mana('C'),
      activated('{2}{R}{W}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'double strike' }]);
      }, { targets: [t.creature()], text: '{2}{R}{W}, {T}: A criatura alvo ganha golpe duplo até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.4c — ganhar golpe duplo depois do dano de primeiro golpe faz causar dano também no normal (motor/combat.ts)',
    2: 'regra geral: CR 702.4d — ganhar golpe duplo depois de todo o dano de combate não dá dano a mais',
  },
});
