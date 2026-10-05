// Ark of Hunger
// Whenever one or more cards leave your graveyard, this artifact deals 1 damage to each opponent and you gain 1 life.
// {T}: Mill a card. You may play that card this turn.
import { activated, addEffect, dealDamage, defineCard, gainLife, mill, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ark of Hunger',
  faces: [{
    abilities: [
      // ruling 1: várias cartas ao mesmo tempo disparam uma vez só
      triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you)), function* (c) {
        dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 1, combat: false })));
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma ou mais cartas saem do seu cemitério, este artefato causa 1 de dano a cada oponente e você ganha 1 de vida.' }),
      activated('{T}', function* (c) {
        const moidas = yield* mill(c.g, c.you, 1);
        // ruling 2: pode jogar qualquer das cartas moídas
        if (moidas.length) addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'endOfTurn' }, affected: null, mods: [{ k: 'rule', id: 'rule:mayPlay', params: { objs: moidas, player: c.you } }] });
      }, { text: '{T}: Moa uma carta. Você pode jogar essa carta neste turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: várias cartas saindo juntas disparam uma vez',
    2: 'regra geral: a permissão vale para todas as cartas moídas pela habilidade',
  },
});
