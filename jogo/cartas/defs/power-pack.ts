// Power Pack
// Flying, vigilance, trample, haste
// Whenever Power Pack deals combat damage to a player, exile target instant or sorcery card from your graveyard chosen at
// random. At the beginning of your next upkeep, you may cast that card without paying its mana cost. If that spell would
// be put into your graveyard, exile it instead.
import { castSpell, defineAbility, defineCard, delayed, exile, is, keywords, nameOf, on, triggered, yesNo } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ObjId } from '../../motor/types.ts';

// "no início da sua próxima manutenção": só a sua, e não a do turno em que o gatilho foi criado
const CONJURA = defineAbility('Power Pack:conjura', triggered({
  kind: 'event',
  match: (e, c) => e.type === 'step' && e.step === 'upkeep' && c.g.state.turn.active === c.you
    && c.g.state.turn.number > ((c as unknown as { delayed?: { createdTurn: number } }).delayed?.createdTurn ?? -1),
}, function* (c) {
  const carta = c.data.carta as ObjId;
  if (c.g.state.objects[carta]?.zone !== 'exile') return;
  if (!(yield* yesNo(c.g, c.you, `Power Pack: conjurar ${nameOf(c.g, carta)} sem pagar o custo de mana?`))) return;
  // CR 608.2g: conjurada durante a resolução; se fosse para o seu cemitério, é exilada em vez disso
  yield* castSpell(c.g, c.you, carta, {
    key: 'free', label: 'sem pagar o custo de mana', zone: 'exile', free: true, duringResolution: true,
    permission: { key: `power-pack:${carta}`, label: 'Power Pack', free: true, exileInstead: true },
  });
}, { text: 'No início da sua próxima manutenção, você pode conjurar a carta exilada sem pagar o custo de mana. Se essa mágica fosse para o seu cemitério, exile-a em vez disso.' }));

export default defineCard({
  name: 'Power Pack',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance', 'trample', 'haste'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        // a carta é sorteada entre as mágicas instantâneas e de feitiço do seu cemitério (o motor sorteia na resolução)
        const cartas = s.zones.graveyard[c.you].filter((id) => is.instantOrSorcery({ g: c.g, you: c.you, source: c.source }, id));
        if (!cartas.length) return;
        const [sorteada] = shuffle(s.rng, [...cartas]);
        const [ex] = yield* exile(c.g, [sorteada]);
        if (ex !== null && ex !== undefined && s.objects[ex]?.zone === 'exile') delayed(c, CONJURA.id!, { data: { carta: ex } });
      }, { text: 'Sempre que Power Pack causa dano de combate a um jogador, exile uma carta instantânea ou de feitiço do seu cemitério escolhida ao acaso. No início da sua próxima manutenção, você pode conjurá-la sem pagar o custo de mana. Se essa mágica fosse para o seu cemitério, exile-a em vez disso.' }),
    ],
  }],
  rulings: {},
});
