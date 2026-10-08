import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { temPalavrasChave } from '../../testes/padroes.ts';

describe('Zetalpa, Primal Dawn', () => {
  it('tem voar, golpe duplo, vigilância, atropelar e indestrutível', () => {
    expect(temPalavrasChave('Zetalpa, Primal Dawn', 'flying', 'double strike', 'vigilance', 'trample', 'indestructible')).toBe(true);
  });

  it('CR 702.4b, 702.19d: se o primeiro golpe mata os bloqueadores, todo o dano normal vai ao jogador', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Zetalpa, Primal Dawn'], ['Arboreal Grazer']] });
    tg.attack([['Zetalpa, Primal Dawn', 1]]).block([['Arboreal Grazer', 'Zetalpa, Primal Dawn']]);
    tg.script.push((d) => (d.kind === 'damage' ? { kind: 'damage', assign: [d.lethal[0], d.amount - d.lethal[0]] } : null));
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40 - 1 - 4);
    expect(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].tapped).toBe(false); // vigilância
  });
});
