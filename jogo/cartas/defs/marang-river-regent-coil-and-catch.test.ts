import { describe, expect, it } from 'vitest';
import { castSpell, chars, copySpell, hasKw } from '../../motor/api.ts';
import { novoDiario } from '../../motor/diario.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Marang River Regent // Coil and Catch';
describe(N, () => {
  it('a face de criatura tem voar, devolve até duas outras permanentes não terreno e fica no campo', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Island'), 'Sol Ring'], ['Indomitable Ancients', 'Swamp']], hand: [[N], []] });
    tg.choose('até duas outras permanentes', ['Sol Ring', 'Indomitable Ancients']).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 7]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(1, 'hand')).toEqual(['Indomitable Ancients']);
    expect(tg.find('Swamp')).not.toBeNull();
  });
  it('a entrada permite escolher zero alvos e nunca oferece a própria criatura nem terrenos', () => {
    const tg = setup({ battlefield: [Array(6).fill('Island'), ['Swamp']], hand: [[N], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => d.kind === 'select' && d.prompt.includes('até duas outras permanentes')
      ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: [] }) : null);
    tg.cast(N).resolveAll();
    expect(opcoes).toEqual([]);
    expect(tg.find(N)).not.toBeNull();
  });
  it('presságio compra três, descarta uma e embaralha a própria carta no grimório do dono', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), []], hand: [[N], []], library: [['Plains', 'Swamp', 'Forest', 'Mountain'], []] });
    tg.choose('Descarte', ['Swamp']).cast(N, 'hand@1');
    const c = chars(tg.g, tg.state.zones.stack[0]);
    expect([c.name, c.types, c.subtypes, c.manaValue]).toEqual(['Coil and Catch', ['Instant'], ['Omen'], 4]);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Forest']);
    expect(tg.names(0, 'graveyard')).toEqual(['Swamp']);
    expect(tg.names(0, 'library').sort()).toEqual(['Marang River Regent', 'Mountain']);
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'exile')).toEqual([]);
  });
  it('CR 720.4: fora da pilha, só é criatura com valor de mana 6', () => {
    const tg = setup({ graveyard: [[N], []], hand: [[N], []] });
    for (const zona of ['hand', 'graveyard'] as const) {
      const c = chars(tg.g, tg.find(N, zona)!);
      expect([c.name, c.types, c.subtypes, c.manaValue]).toEqual(['Marang River Regent', ['Creature'], ['Dragon'], 6]);
    }
  });
  it('presságio anulado vai para o cemitério sem comprar, descartar ou embaralhar', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), ['Island', 'Island']], hand: [[N], ['Counterspell']], library: [['Forest', 'Swamp', 'Mountain'], []] });
    tg.g.diario = novoDiario();
    tg.cast(N, 'hand@1').pass().cast('Counterspell').resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Swamp', 'Mountain']);
    expect(tg.g.diario.entradas.some((e) => e.ev.type === 'shuffle')).toBe(false);
  });
  it('CR 720.3c-d: a cópia do presságio também embaralha o grimório do dono e deixa de existir', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), []], hand: [[N], []], library: [Array(6).fill('Island'), ['Forest', 'Swamp', 'Mountain', 'Plains', 'Sol Ring']] });
    tg.cast(N, 'hand@1');
    runEffect(tg, copySpell(tg.g, tg.state.zones.stack[0], 1));
    tg.g.diario = novoDiario();
    tg.choose('Descarte', ['Swamp']).resolve();
    expect(tg.names(1, 'hand')).toEqual(['Forest', 'Mountain']);
    expect(tg.g.diario.entradas.filter((e) => e.ev.type === 'shuffle').map((e) => e.ev.type === 'shuffle' ? e.ev.player : -1)).toEqual([1]);
    expect(Object.values(tg.state.objects).filter((o) => o.isCopy)).toEqual([]);
    expect(tg.state.zones.stack).toHaveLength(1);
    expect(tg.find(N, 'library', 1)).toBeNull();
  });
  it('CR 720.3a: a permissão para criaturas do topo não permite conjurar o presságio', () => {
    const tg = setup({ battlefield: [['Thundermane Dragon', ...Array(6).fill('Island')], []], library: [[N, 'Forest'], []] });
    const id = tg.find(N, 'library')!;
    const acoes = tg.actionIds().filter((a) => a.startsWith('cast:') && a.split(':').includes(String(id)));
    expect(acoes).toHaveLength(1);
    expect(acoes[0]).not.toContain('@1');
  });
  it('CR 720.3: conjurar o presságio sem pagar mana ainda compra e embaralha normalmente', () => {
    const tg = setup({ hand: [[N], []], library: [['Forest', 'Swamp', 'Plains', 'Island'], []] });
    tg.choose('Descarte', ['Swamp']);
    expect(runEffect(tg, castSpell(tg.g, 0, tg.find(N, 'hand')!, { key: 'teste', label: 'Conjurar sem pagar mana', zone: 'hand', free: true, face: 1, duringResolution: true }))).not.toBeNull();
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest', 'Plains']);
    expect(tg.find(N, 'library')).not.toBeNull();
  });
});
