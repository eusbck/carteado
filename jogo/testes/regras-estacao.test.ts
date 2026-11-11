// lote3-b: Estação (station, CR 702.184) e cartas de estação (CR 721), com Queen's Diamond e Borg Scout Sphere.
import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../motor/chars.ts';
import { fixture as setup } from './artefatos.ts';

const DIAMANTE = "Queen's Diamond";
const ESFERA = 'Borg Scout Sphere';

describe('CR 702.184 e 721: estação', () => {
  it('CR 702.184a: vira outra criatura e põe marcadores de carga iguais à força dela; sem os marcadores não é criatura (721.2b)', () => {
    const tg = setup({ battlefield: [[DIAMANTE, 'Zetalpa, Primal Dawn'], []] });
    const d = tg.bf(DIAMANTE);
    expect(chars(tg.g, d).types).not.toContain('Creature');
    tg.choose('Vire 1', ['Zetalpa, Primal Dawn']).activate(DIAMANTE, 'Estação').resolveAll();
    expect(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].tapped).toBe(true);
    expect(tg.state.objects[d].counters.charge).toBe(4);
    expect(chars(tg.g, d).types).not.toContain('Creature');
    expect(hasKw(tg.g, d, 'flying')).toBe(false);
  });

  it('CR 721.2b: com N ou mais marcadores, é criatura com a força e a resistência do quadro e as habilidades da faixa', () => {
    const tg = setup({ battlefield: [[{ name: DIAMANTE, counters: { charge: 8 } }], []] });
    const d = tg.bf(DIAMANTE);
    expect(chars(tg.g, d).types).toEqual(expect.arrayContaining(['Artifact', 'Creature']));
    expect(tg.pt(d)).toEqual([5, 5]);
    for (const kw of ['flying', 'vigilance', 'haste']) expect(hasKw(tg.g, d, kw), kw).toBe(true);
  });

  it('CR 702.184a: só como feitiço e só com outra criatura (a própria permanente não serve)', () => {
    const tg = setup({ battlefield: [[{ name: DIAMANTE, counters: { charge: 8 } }], ['Wall of Omens']], step: 'upkeep' });
    const acoes = () => (tg.pending?.kind === 'priority' ? tg.pending.actions.map((a) => a.label) : []);
    expect(acoes().some((l) => l.includes('Estação'))).toBe(false);
    tg.passTo('main1');
    // a única criatura que ele controla é ele mesmo: não pode se virar para a própria estação
    expect(acoes().some((l) => l.includes('Estação'))).toBe(false);
  });

  it('CR 721.2a: faixa sem quadro de força e resistência só dá a habilidade (Borg Scout Sphere 6+)', () => {
    const tg = setup({ battlefield: [[{ name: ESFERA, counters: { charge: 5 } }, 'Steel Overseer', 'Wall of Omens'], []] });
    const ov = tg.bf('Steel Overseer');
    expect(hasKw(tg.g, ov, 'flying')).toBe(false);
    tg.state.objects[tg.bf(ESFERA)].counters.charge = 6;
    tg.g.bump();
    expect(hasKw(tg.g, ov, 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'flying')).toBe(false);
    expect(chars(tg.g, tg.bf(ESFERA)).types).not.toContain('Creature');
  });

  it("Queen's Diamond: a mana, de uma cor por marcador, só paga o seu comandante", () => {
    const tg = setup({ battlefield: [[{ name: DIAMANTE, counters: { charge: 8 } }], []], command: [['Zetalpa, Primal Dawn'], []], hand: [['Wall of Omens'], []] });
    expect(tg.canCast('Wall of Omens')).toBe(false);
    expect(tg.canCast('Zetalpa, Primal Dawn')).toBe(true);
    tg.cast('Zetalpa, Primal Dawn', 'command').resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.state.objects[tg.bf(DIAMANTE)].tapped).toBe(true);
  });
});
