// lote4-a: recursos de terrenos no motor (motor/terrenos.ts e o gancho topOfLibraryRevealed em motor/view.ts)
import { describe, expect, it } from 'vitest';
import { buildView } from '../motor/view.ts';
import { setup } from './harness.ts';

type Tg = ReturnType<typeof setup>;
function ativaMana(tg: Tg, nome: string, alt = 0): void {
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  const a = d.actions.find((x) => x.obj === tg.bf(nome) && x.id.endsWith(`|${alt}`));
  if (!a) throw new Error(`sem ação: ${d.actions.map((x) => x.label).join(' | ')}`);
  tg.answer({ kind: 'priority', action: a.id });
  tg.settle();
}
const topoVisto = (tg: Tg, quemVe: number, dono: number) =>
  (buildView(tg.g, quemVe, null) as unknown as { players: { topCard?: { name: string } }[] }).players[dono].topCard?.name;

describe('Mana que depende do custo pago (CR 106.7, ManaAbilityDef.produceFromCost)', () => {
  it('CR 106.7: o que o terreno sacrificado poderia produzir inclui as habilidades concedidas a ele no campo', () => {
    // Tectonic Split dá aos terrenos "{T}: três manas de uma cor"; a Forest sacrificada poderia produzir {R}
    const tg = setup({ battlefield: [['Squandered Resources', 'Tectonic Split', 'Forest'], []] });
    // a alternativa {R} (W, U, B, R, G): a Forest sacrificada só a dá pela habilidade concedida
    tg.choose('Sacrifique um terreno', ['Forest']);
    ativaMana(tg, 'Squandered Resources', 3);
    expect(tg.find('Forest')).toBeNull();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['R']);
  });
});

describe('Manutenção cumulativa pagando vida (CR 702.24a, 119.4: cumulativeUpkeepLife)', () => {
  it('CR 119.4: sem vida suficiente para pagar, não pode pagar e sacrifica', () => {
    const tg = setup({ battlefield: [[{ name: 'Glacial Chasm', counters: { age: 2 } }], []], step: 'untap', life: 5 });
    tg.passTo('upkeep');
    tg.resolve();
    expect(tg.find('Glacial Chasm')).toBeNull();
    expect(tg.life(0)).toBe(5);
  });
});

describe('Topo do grimório revelado (gancho topOfLibraryRevealed)', () => {
  it('sem o gancho, o oponente não vê o topo; com ele, todos veem', () => {
    const sem = setup({ library: [["Night's Whisper"], []] });
    expect(topoVisto(sem, 1, 0)).toBeUndefined();
    const com = setup({ battlefield: [['Oracle of Mul Daya'], []], library: [["Night's Whisper"], []] });
    expect(topoVisto(com, 1, 0)).toBe("Night's Whisper");
    expect(topoVisto(com, 0, 0)).toBe("Night's Whisper");
    // o do oponente continua escondido
    expect(topoVisto(com, 0, 1)).toBeUndefined();
  });
});
