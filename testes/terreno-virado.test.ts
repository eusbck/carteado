// Fase 9, item 1.2: terreno que entra virado não põe mana na reserva, e o pagamento automático vira só o
// que paga o custo. A mana que aparecia na reserva vinha do planejamento do pagamento automático (que os
// bots sempre usam e a pessoa usa com o auxílio "Pagar automaticamente"): ele virava terrenos que no fim
// não pagavam nada, e a mana deles sobrava na reserva até o fim da etapa.
import { describe, expect, it } from 'vitest';
import decksJson from '../gerado/decks.json' with { type: 'json' };
import { manaOptions, planPayment } from '../motor/costs.ts';
import { parseCost } from '../motor/mana.ts';
import { oracle } from '../motor/oracle.ts';
import type { DeckList } from '../motor/state.ts';
import { setup, type TestGame } from './harness.ts';

const DECKS = decksJson as DeckList[];
const reserva = (tg: TestGame, p = 0) => tg.state.players[p].manaPool.map((u) => u.type).join('');
const virados = (tg: TestGame, nome: string) => tg.all(nome).filter((id) => tg.state.objects[id].tapped).length;

/** terrenos não básicos dos decks */
const TERRENOS = [...new Set(DECKS.flatMap((d) => d.cartas.map((c) => c.nome)))].filter((n) => {
  const f = oracle(n).faces[0];
  return f.types.includes('Land') && !f.supertypes.includes('Basic');
});

describe('fase 9 (1.2): terreno que entra virado', () => {
  it('não gera mana nem vira fonte de mana até desvirar no próximo turno do dono', () => {
    let entraramVirados = 0;
    for (const nome of TERRENOS) {
      const tg = setup({ battlefield: [['Forest'], []], hand: [[nome], []], library: [['Forest', 'Forest', 'Forest'], ['Forest', 'Forest', 'Forest']] });
      tg.yes('Revelar', false);
      tg.play(nome);
      tg.resolveAll();
      const id = tg.find(nome, 'battlefield', 0);
      if (id === null || !tg.state.objects[id].tapped) continue;
      entraramVirados++;
      expect(reserva(tg), nome).toBe('');
      expect(manaOptions(tg.g, 0).some((o) => o.obj === id), nome).toBe(false);
      // no próximo turno de quem jogou, desvira normalmente (CR 502.3)
      tg.passTo('upkeep', 0);
      if (tg.state.objects[id]) expect(tg.state.objects[id].tapped, nome).toBe(false);
    }
    // os decks têm dezenas de terrenos que entram virados (templos, campi, terrenos-ponte…)
    expect(entraramVirados).toBeGreaterThan(30);
  });

  it('o pagamento automático vira só o que paga: nada sobra na reserva', () => {
    // a situação da partida: joga Radiant Grove (entra virado) e conjura Faeburrow Elder ({1}{G}{W}) pagando
    // no automático; antes virava as quatro Forests e a Plains e sobrava {G}{G} na reserva
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Plains'], []], hand: [['Radiant Grove', 'Faeburrow Elder'], []] });
    tg.play('Radiant Grove');
    expect(tg.state.objects[tg.bf('Radiant Grove')].tapped).toBe(true);
    expect(reserva(tg)).toBe('');
    tg.cast('Faeburrow Elder');
    expect(reserva(tg)).toBe('');
    expect(virados(tg, 'Forest')).toBe(2);
    expect(virados(tg, 'Plains')).toBe(1);
    tg.resolve();
    expect(tg.find('Faeburrow Elder')).not.toBeNull();
  });

  it('o plano do pagamento automático não leva fontes que sobram', () => {
    const plano = (campo: string[], custo: string) => {
      const tg = setup({ battlefield: [campo, []] });
      return planPayment(tg.g, 0, parseCost(custo), { purpose: { kind: 'effect' } }, 0, true)?.map((o) => tg.state.objects[o.obj].def).sort();
    };
    expect(plano(['Forest', 'Swamp', 'Swamp', 'Swamp', 'Plains'], '{W}')).toEqual(['Plains']);
    expect(plano(['Swamp', 'Forest', 'Forest', 'Plains', 'Island'], '{1}{G}{W}')).toHaveLength(3);
    expect(plano(['Forest', 'Swamp', 'Island'], '{2}')).toHaveLength(2);
    expect(plano(['Forest', 'Swamp'], '{W}')).toBeUndefined();
  });
});
