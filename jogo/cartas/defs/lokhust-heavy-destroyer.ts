// Lokhust Heavy Destroyer
// Flying
// Enmitic Exterminator — When this creature enters, each player sacrifices a creature of their choice.
// Unearth {5}{B}{B}{B} ({5}{B}{B}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it
// at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)
import { defineCard, eachSacrifices, etb, isCreature, keyword, unearth } from '../../motor/api.ts';
import { DESENTERRAR } from '../necrons.ts';

export default defineCard({
  name: 'Lokhust Heavy Destroyer',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 2: o jogador ativo escolhe primeiro, depois os outros em ordem; todos sacrificam ao mesmo tempo
      etb(function* (c) { yield* eachSacrifices(c, c.g.apnap(), (id) => isCreature(c.g, id), 1, 'uma criatura'); }, {
        text: 'Enmitic Exterminator — Quando esta criatura entra, cada jogador sacrifica uma criatura à escolha dele.',
      }),
      unearth('{5}{B}{B}{B}'),
    ],
  }],
  rulings: {
    1: 'teste: ao entrar, cada jogador sacrifica uma criatura; sem outra, você sacrifica o próprio Destroyer',
    2: 'regra geral: CR 101.4 — o jogador ativo escolhe primeiro, os outros em ordem de turno, e todos sacrificam ao mesmo tempo (motor/efeitos.ts eachSacrifices)',
    3: DESENTERRAR.sumiu,
    4: DESENTERRAR.naoMagica,
    5: DESENTERRAR.sairia,
    6: DESENTERRAR.etapaFinal,
    7: DESENTERRAR.impeto,
  },
});