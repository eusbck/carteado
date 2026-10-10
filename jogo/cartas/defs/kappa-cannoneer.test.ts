import { describe, expect, it } from 'vitest';
import { canBlock } from '../../motor/combat.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Kappa Cannoneer";
describe(N, () => {
  it('cancelar depois de produzir mana e improvisar restaura a carta, reserva e artefatos virados', () => {
    const tg = setup({ battlefield: [['Island', ...Array.from({ length: 5 }, () => ({ name: 'Myr', token: true, ready: false }))], []], hand: [[N], []] });
    tg.script.push((d) => d.kind === 'payment' ? { kind: 'payment', activate: { source: d.sources.find((s) => s.obj === tg.bf('Island'))!.id } } : null);
    tg.script.push((d) => d.kind === 'payment' ? { kind: 'payment', activate: { source: d.sources.find((s) => s.id.startsWith('improvise:'))!.id } } : null);
    tg.script.push((d) => d.kind === 'payment' ? { kind: 'payment', cancel: true } : null);
    tg.cast(N);
    expect(tg.names(0, 'hand')).toEqual([N]); expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.state.players[0].manaPool).toHaveLength(0);
    expect(tg.state.zones.battlefield.every((id) => !tg.state.objects[id].tapped)).toBe(true);
  });
  it('resguardo anula a remoção quando o oponente não pode pagar quatro', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Plains']], hand: [[], ['Swords to Plowshares']] });
    tg.script.push((d) => d.kind === 'payment' && d.prompt.includes('resguardo') ? { kind: 'payment', cancel: true } : null);
    tg.choose('criatura alvo', [N]).cast('Swords to Plowshares').resolveAll();
    expect(tg.find(N)).not.toBeNull(); expect(tg.find('Swords to Plowshares', 'graveyard')).not.toBeNull();
  });
  it("improvisa com artefatos com enjoo sem gerar mana; entrada marca a si e impede bloqueio", () => {

    const tg = setup({ battlefield: [['Island', ...Array.from({ length: 5 }, () => ({ name: 'Myr', token: true, ready: false }))], ['Wall of Omens']], hand: [[N], []] }); expect(tg.canCast(N)).toBe(true); tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]); expect(tg.all('Myr').every(id => tg.state.objects[id].tapped)).toBe(true); expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf(N))).toBe(false);
    enterCard(tg, 'Aether Spellbomb', 0); tg.resolveAll(); expect(tg.pt(tg.bf(N))).toEqual([6, 6]);
  });
});
