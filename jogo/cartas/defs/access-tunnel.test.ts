import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Access Tunnel', () => {
  it('{T}: adiciona {C}', () => expect(alternativasDeMana('Access Tunnel')).toEqual(['C']));
  it('a criatura alvo de força 3 ou menos não pode ser bloqueada neste turno', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Access Tunnel', 'Sol Ring', 'Plains', 'Indomitable Ancients'], ['Wall of Omens']] });
    tg.choose('força 3 ou menos', ['Indomitable Ancients']).activate('Access Tunnel', 'bloqueada').resolve();
    tg.attack([['Indomitable Ancients', 1]]);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(38);
  });
  it('com força acima de 3 na resolução, a habilidade não resolve; depois de resolver, aumentar a força não importa', () => {
    const tg = setup({ battlefield: [['Access Tunnel', 'Sol Ring', 'Plains', { name: 'Indomitable Ancients', counters: { '+1/+1': 2 } }], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false); // 4/12: nenhum alvo
  });
});
