// The Balrog of Moria
// Trample, haste
// When The Balrog of Moria dies, you may exile it. When you do, for each opponent, exile up to one target creature that
// player controls.
// Cycling {3}{R} ({3}{R}, Discard this card: Draw a card.)
// When you cycle this card, create two Treasure tokens.
import { createTokens, cycling, defineAbility, defineCard, exile, keywords, lkiObj, on, reflexive, triggered, yesNo } from '../../motor/api.ts';
import { umaPorOponente } from '../viloes.ts';

const ciclagem = cycling('{3}{R}');

// CR 603.12: gatilho reflexivo — os alvos são escolhidos depois de exilar o Balrog
const EXILA = defineAbility('The Balrog of Moria:exila', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' ? [r.id] : []));
  if (ids.length) yield* exile(c.g, ids);
}, { targets: [umaPorOponente('para cada oponente, até uma criatura alvo que esse jogador controla')], text: 'Para cada oponente, exile até uma criatura alvo que esse jogador controla.' }));

export default defineCard({
  name: 'The Balrog of Moria',
  faces: [{
    abilities: [
      ...keywords('trample', 'haste'),
      triggered(on.selfDies(), function* (c) {
        // a carta do Balrog no cemitério (se ainda estiver lá)
        const carta = c.g.state.lki[c.source]?.newId ?? null;
        if (carta === null || c.g.state.objects[carta]?.zone !== 'graveyard') return;
        if (!(yield* yesNo(c.g, c.you, 'The Balrog of Moria: exilá-lo do cemitério?'))) return;
        const [ex] = yield* exile(c.g, [carta]);
        if (ex !== null && ex !== undefined) reflexive(c, EXILA.id!);
      }, { text: 'Quando The Balrog of Moria morre, você pode exilá-lo. Quando fizer isso, para cada oponente, exile até uma criatura alvo que esse jogador controla.' }),
      ciclagem,
      // CR 702.29c
      triggered(on.custom((e, c) => {
        if (e.type !== 'activate' || e.abilityId !== ciclagem.id) return false;
        const antes = lkiObj(c.g, e.source);
        return !!antes && antes.card !== null && antes.card === c.obj.card;
      }), function* (c) { yield* createTokens(c.g, c.you, 'Treasure', 2); }, { zones: ['graveyard', 'exile'], text: 'Quando você cicla esta carta, crie duas fichas de Treasure.' }),
    ],
  }],
  rulings: {
    1: 'teste: ciclando, cria dois Treasures antes de você comprar a carta',
    2: 'regra geral: CR 702.29c — a ciclagem e o gatilho dela são habilidades, não mágicas',
  },
});
