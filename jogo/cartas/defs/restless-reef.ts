// Restless Reef
// This land enters tapped.
// {T}: Add {U} or {B}.
// {2}{U}{B}: Until end of turn, this land becomes a 4/4 blue and black Shark creature with deathtouch. It's still a land.
// Whenever this land attacks, target player mills four cards.
import { activated, defineCard, land, mana, mill, on, t, tgtPlayer, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Restless Reef',
  faces: [{ abilities: [
    land.tapped(),
    mana(['U', 'B']),
    activated('{2}{U}{B}', function* (c) {
      if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
      untilEndOfTurn(c, [c.source], [
        { k: 'addTypes', types: ['Creature'], subtypes: ['Shark'] },
        { k: 'setColors', colors: ['U', 'B'] }, { k: 'setPT', p: 4, t: 4 }, { k: 'addKeyword', kw: 'deathtouch' },
      ]);
    }, { text: '{2}{U}{B}: Até o fim do turno, este terreno vira uma criatura Shark azul e preta 4/4 com toque mortífero. Continua sendo terreno.' }),
    triggered(on.selfAttacks(), function* (c) {
      const p = tgtPlayer(c);
      if (p !== null) yield* mill(c.g, p, 4);
    }, { targets: [t.player()], text: 'Sempre que este terreno ataca, o jogador alvo mói quatro cartas.' }),
  ] }],
  rulings: {
    1: 'teste: dispara mesmo se outro efeito animar o terreno e permite mirar você mesmo',
    2: 'teste: CR 302.6: terreno recém-controlado animado não ataca nem produz mana',
  },
});
