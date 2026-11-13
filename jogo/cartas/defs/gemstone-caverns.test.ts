import { describe, expect, it } from 'vitest';
import { Game } from '../../motor/game.ts';
import type { DeckList } from '../../motor/state.ts';
import type { Decision } from '../../motor/types.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Gemstone Caverns';

function deck(id: string): DeckList {
  return { id, nome: id, comandante: 'Orvar, the All-Form', cartas: [{ nome: N, quantidade: 60 }, { nome: 'Island', quantidade: 39 }] };
}

describe(N, () => {
  it('depois dos mulligans, quem não começa pode pôr Gemstone Caverns no campo e exila uma carta da mão', () => {
    const game = Game.create({ seed: 'caverna', players: [{ name: 'Ana', deckId: 'a' }, { name: 'Bruno', deckId: 'b' }], startingLife: 40, turnLimit: null, multiplayer: false }, [deck('a'), deck('b')]);
    const perguntas: Decision[] = [];
    let aceitou = false;
    for (let i = 0; i < 40 && game.pending && game.pending.kind !== 'priority'; i++) {
      const d = game.pending;
      if (d.kind === 'mulligan') { game.answer(d.player, { kind: 'mulligan', keep: true }); continue; }
      if (d.kind === 'select' && d.prompt.includes('(mão inicial)')) {
        perguntas.push(d);
        game.answer(d.player, { kind: 'select', ids: [aceitou ? 'no' : 'yes'] });
        aceitou = true;
        continue;
      }
      if (d.kind === 'select' && d.prompt.includes('exile uma carta')) { game.answer(d.player, { kind: 'select', ids: [d.items[0].id] }); continue; }
      if (d.kind === 'select') { game.answer(d.player, { kind: 'select', ids: d.items.slice(0, d.min).map((x) => x.id) }); continue; }
      break;
    }
    const s = game.state;
    const inicial = s.turnOrder[0];
    // só o jogador que não começa é perguntado
    expect(perguntas.length).toBeGreaterThan(0);
    expect(perguntas.every((d) => d.player !== inicial)).toBe(true);
    const outro = perguntas[0].player;
    const cavernas = s.zones.battlefield.filter((id) => s.objects[id].def === N);
    expect(cavernas).toHaveLength(1);
    expect(s.objects[cavernas[0]].counters.luck).toBe(1);
    expect(s.objects[cavernas[0]].controller).toBe(outro);
    expect(s.zones.hand[outro]).toHaveLength(5);
    expect(s.zones.exile.filter((id) => s.objects[id].owner === outro)).toHaveLength(1);
  });
  it('{T}: {C}; com marcador de sorte, uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Opt'], []] });
    expect(tg.canCast('Opt')).toBe(false);
    const tg2 = setup({ battlefield: [[{ name: N, counters: { luck: 1 } }], []], hand: [['Opt'], []] });
    expect(tg2.canCast('Opt')).toBe(true);
  });
});
