// Tariel, Reckoner of Souls
// Flying, vigilance
// {T}: Choose a creature card at random from target opponent's graveyard. Put that card onto the battlefield under your
// control.
import { activated, defineCard, isCreature, keywords, nameOf, putOntoBattlefield, t, tgtPlayer } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';

export default defineCard({
  name: 'Tariel, Reckoner of Souls',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance'),
      activated('{T}', function* (c) {
        const s = c.g.state;
        const p = tgtPlayer(c);
        if (p === null) return;
        // ruling 2: sorteada na resolução, entre as cartas de criatura que estão no cemitério
        const cartas = s.zones.graveyard[p].filter((id) => isCreature(c.g, id));
        if (!cartas.length) return;
        const [carta] = shuffle(s.rng, [...cartas]);
        c.g.log(`Tariel sorteia ${nameOf(c.g, carta)} do cemitério de ${s.players[p].name}.`);
        yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
      }, {
        // ruling 1: o único alvo é o oponente
        targets: [t.opponent()],
        text: '{T}: Escolha ao acaso uma carta de criatura do cemitério do oponente alvo. Coloque essa carta no campo sob o seu controle.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: sorteia uma carta de criatura do cemitério do oponente alvo e a põe no campo sob o seu controle',
    2: 'teste: sorteia uma carta de criatura do cemitério do oponente alvo e a põe no campo sob o seu controle',
  },
});