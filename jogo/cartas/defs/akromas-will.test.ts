import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Akroma's Will";
const TERRAS = ['Plains', 'Plains', 'Plains', 'Plains'];

describe(N, () => {
  it('controlando um comandante, pode escolher os dois modos; sem ele, só um', () => {
    // o comandante é de outro jogador, mas está sob o seu controle: conta (ruling 5)
    const tg = setup({ battlefield: [[...TERRAS, 'Silver Myr'], [{ name: 'Wyleth, Soul of Steel', commander: true }]], hand: [[N], []] });
    tg.state.objects[tg.bf('Wyleth, Soul of Steel')].controller = 0;
    tg.refresh();
    let max = 0;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('modo') ? ((max = d.max), { kind: 'select', ids: d.items.map((i) => i.id) }) : null));
    tg.cast(N).resolveAll();
    expect(max).toBe(2);
    const myr = tg.bf('Silver Myr');
    for (const kw of ['flying', 'vigilance', 'double strike', 'lifelink', 'indestructible']) expect(hasKw(tg.g, myr, kw)).toBe(true);

    const sem = setup({ battlefield: [[...TERRAS, 'Silver Myr'], []], hand: [[N], []] });
    let max2 = 0;
    sem.script.push((d) => (d.kind === 'select' && d.prompt.includes('modo') ? ((max2 = d.max), { kind: 'select', ids: [d.items[0].id] }) : null));
    sem.cast(N).resolveAll();
    expect(max2).toBe(1);
    expect(hasKw(sem.g, sem.bf('Silver Myr'), 'flying')).toBe(true);
    expect(hasKw(sem.g, sem.bf('Silver Myr'), 'lifelink')).toBe(false);
  });

  it('proteção contra as cinco cores, não contra incolor', () => {
    const tg = setup({ battlefield: [[...TERRAS, 'Silver Myr'], []], hand: [[N], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('modo') ? { kind: 'select', ids: [d.items[1].id] } : null));
    tg.cast(N).resolveAll();
    const prot = tg.g.state.effects.flatMap((e) => e.mods).filter((m) => m.k === 'addKeyword' && m.kw === 'protection').map((m) => (m as { param?: unknown }).param);
    expect(prot.sort()).toEqual(['color:B', 'color:G', 'color:R', 'color:U', 'color:W']);
  });
});
