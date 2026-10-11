import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const P = 'Ponder';

describe(P, () => {
  it('olha as três do topo, devolve na ordem escolhida e compra uma carta', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[P], []], library: [['Plains', 'Swamp', 'Mountain', 'Forest'], []] });
    let vistas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Ponder: ponha')) return null;
      vistas = d.items.map((i) => i.label);
      const id = (n: string) => d.items.find((i) => i.label === n)!.id;
      return { kind: 'select', ids: [id('Mountain'), id('Plains'), id('Swamp')] };
    });
    tg.yes('embaralhar', false);
    tg.cast(P).resolve();
    expect(vistas).toEqual(['Plains', 'Swamp', 'Mountain']);
    expect(tg.names(0, 'hand')).toEqual(['Mountain']);
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Swamp', 'Forest']);
  });
  it('embaralhar inclui as três cartas olhadas', () => {
    const resto = Array.from({ length: 12 }, (_, i) => (i % 2 ? 'Forest' : 'Island'));
    const tg = setup({ battlefield: [['Island'], []], hand: [[P], []], library: [['Plains', 'Swamp', 'Mountain', ...resto], []] });
    const id = (d: { items: { id: string; label: string }[] }, n: string) => d.items.find((i) => i.label === n)!.id;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Ponder: ponha') ? { kind: 'select', ids: [id(d, 'Plains'), id(d, 'Swamp'), id(d, 'Mountain')] } : null));
    tg.yes('embaralhar', true);
    tg.cast(P).resolve();
    const todas = [...tg.names(0, 'hand'), ...tg.names(0, 'library')];
    expect(todas.sort()).toEqual(['Plains', 'Swamp', 'Mountain', ...resto].sort());
    // as três não ficaram presas no topo na ordem escolhida
    expect([...tg.names(0, 'hand'), ...tg.names(0, 'library').slice(0, 2)]).not.toEqual(['Plains', 'Swamp', 'Mountain']);
  });
  it('com menos de três cartas no grimório, olha as que houver', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[P], []], library: [['Plains'], []] });
    tg.yes('embaralhar', false);
    tg.cast(P).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
  });
});
