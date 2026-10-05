// Advanced Reconstruction
// (Gain the next level as a sorcery to add its ability.)
// At the beginning of your first main phase, mill a card, then exile a card from your graveyard at random. You may play
// the exiled card this turn.
// {1}{R}: Level 2
// Whenever one or more cards leave your graveyard, this Class deals 2 damage to each opponent.
// {1}{R}: Level 3
// Spells you cast from anywhere other than your hand cost {2} less to cast.
import { activated, allowPlay, dealDamage, defineCard, exile, mill, on, staticAbility, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

/** nível da Classe (CR 716.3): começa no 1 */
const nivel = (g: G, id: ObjId): number => (g.state.objects[id]?.data.nivel as number | undefined) ?? 1;

export default defineCard({
  name: 'Advanced Reconstruction',
  faces: [{
    abilities: [
      triggered(on.firstMain(), function* (c) {
        const s = c.g.state;
        yield* mill(c.g, c.you, 1);
        const cem = s.zones.graveyard[c.you];
        if (!cem.length) return;
        const [sorteada] = shuffle(s.rng, [...cem]);
        const [ex] = yield* exile(c.g, [sorteada]);
        // ruling 3: paga os custos e segue o tempo normal (terreno só com jogada de terreno disponível)
        if (ex !== null && ex !== undefined) allowPlay(c.g, c.you, c.source, [ex], { kind: 'endOfTurn' });
      }, { text: 'No início da sua primeira fase principal, moa uma carta e depois exile uma carta aleatória do seu cemitério. Você pode jogá-la neste turno.' }),
      // CR 716.2a: subir de nível é habilidade ativada, só como feitiço e a partir do nível anterior
      activated('{1}{R}', function* (c) {
        const o = c.g.state.objects[c.source];
        if (o && nivel(c.g, c.source) === 1) { o.data.nivel = 2; c.g.log('Advanced Reconstruction sobe para o nível 2.', { rule: '716.2a' }); c.g.bump(); }
      }, { timing: 'sorcery', condition: (c) => nivel(c.g, c.source) === 1, text: '{1}{R}: Nível 2' }),
      // ruling 2: um disparo por lote
      triggered(on.batch((evs, c) => nivel(c.g, c.source) >= 2 && evs.some((e) => e.type === 'zone' && e.from === 'graveyard' && e.owner === c.you)), function* (c) {
        dealDamage(c.g, c.g.opponents(c.you).map((p) => ({ source: c.source, target: { kind: 'player' as const, id: p }, amount: 2, combat: false })));
      }, { text: 'Nível 2 — Sempre que uma ou mais cartas saem do seu cemitério, esta Classe causa 2 de dano a cada oponente.' }),
      activated('{1}{R}', function* (c) {
        const o = c.g.state.objects[c.source];
        if (o && nivel(c.g, c.source) === 2) { o.data.nivel = 3; c.g.log('Advanced Reconstruction sobe para o nível 3.', { rule: '716.2a' }); c.g.bump(); }
      }, { timing: 'sorcery', condition: (c) => nivel(c.g, c.source) === 2, text: '{1}{R}: Nível 3' }),
      staticAbility({
        rules: { costModifier: (c, spell) => (nivel(c.g, c.source) >= 3 && spell.controller === c.you && spell.castFrom !== 'hand' ? { reduce: 2 } : null) },
        text: 'Nível 3 — As mágicas que você conjura de qualquer lugar que não seja a sua mão custam {2} a menos.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — custo total; valor de mana não muda',
    2: 'teste: várias cartas saindo juntas causam dano uma vez',
    3: 'teste: a carta exilada pode ser jogada neste turno',
  },
});
