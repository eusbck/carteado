import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Dance with Calamity', () => {
  it('vê cada carta antes de decidir continuar; com total até 13, conjura de graça na ordem escolhida', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Mountain')], []], hand: [['Dance with Calamity'], []], library: [['Elvish Mystic', 'Glissa Sunslayer', 'Island', 'Island', 'Island'], []] });
    let perguntas = 0;
    // exila as cinco cartas (a ordem depende do embaralhamento), vendo o total a cada uma
    for (let i = 0; i < 5; i++) tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('xilar') ? (perguntas++, { kind: 'select', ids: ['yes'] }) : null));
    for (let i = 0; i < 2; i++) {
      tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('próxima mágica') ? { kind: 'select', ids: [d.items[1].id] } : null));
      tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('sem pagar o custo') ? { kind: 'select', ids: ['yes'] } : null));
    }
    tg.cast('Dance with Calamity').resolveAll();
    expect(perguntas).toBe(5);
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Glissa Sunslayer')).not.toBeNull();
    expect(tg.names(0, 'exile')).toEqual(['Island', 'Island', 'Island']); // terrenos ficam no exílio
  });
  it('passou de 13, nada é conjurado', () => {
    const tg = setup({ battlefield: [[...Array(8).fill('Mountain')], []], hand: [['Dance with Calamity'], []], library: [['Treasure Cruise', 'Treasure Cruise', "Night's Whisper"], []] });
    tg.script.push(...Array(3).fill((d: { kind: string; prompt: string }) => (d.kind === 'select' && d.prompt.includes('xilar') ? { kind: 'select' as const, ids: ['yes'] } : null)));
    tg.cast('Dance with Calamity').resolveAll();
    expect(tg.names(0, 'exile').length).toBe(3);
    expect(tg.life(0)).toBe(40);
  });
});
