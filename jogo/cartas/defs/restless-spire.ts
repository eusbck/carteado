// Restless Spire
// This land enters tapped.
// {T}: Add {U} or {R}.
// {U}{R}: Until end of turn, this land becomes a 2/1 blue and red Elemental creature with "During your turn, this
// creature has first strike." It's still a land.
// Whenever this land attacks, scry 1.
import { activated, defineCard, land, lookAndArrange, mana, on, staticAbility, triggered, untilEndOfTurn } from '../../motor/api.ts';

const MARCA = 'Restless Spire:criatura';

export default defineCard({
  name: 'Restless Spire',
  faces: [{
    abilities: [
      land.tapped(),
      mana(['U', 'R']),
      // ruling 1: enjoo de invocação vale normalmente (CR 302.6)
      activated('{U}{R}', function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        untilEndOfTurn(c, [c.source], [
          { k: 'addTypes', types: ['Creature'], subtypes: ['Elemental'] }, { k: 'setPT', p: 2, t: 1 }, { k: 'setColors', colors: ['U', 'R'] },
          { k: 'rule', id: MARCA },
        ]);
      }, { text: '{U}{R}: Até o fim do turno, este terreno vira uma criatura Elemental azul e vermelha 2/1 com "Durante o seu turno, esta criatura tem primeiro golpe." Continua sendo terreno.' }),
      // a habilidade concedida pelo próprio efeito: primeiro golpe durante o seu turno
      staticAbility({
        affects: (c, o) => o.id === c.source && c.g.state.turn.active === c.you
          && c.g.state.effects.some((e) => e.affected?.includes(c.source) && e.mods.some((m) => m.k === 'rule' && m.id === MARCA)),
        mods: () => [{ k: 'addKeyword', kw: 'first strike' }],
        text: 'Enquanto for criatura por este efeito: durante o seu turno, tem primeiro golpe.',
      }),
      // ruling 2: dispara mesmo se virou criatura por outro efeito
      triggered(on.selfAttacks(), function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'scry'); }, { text: 'Sempre que este terreno ataca, vidência 1.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 302.6 — precisa estar sob seu controle desde o início do turno',
    2: 'regra geral: o gatilho de ataque é do terreno, não do efeito',
  },
});
