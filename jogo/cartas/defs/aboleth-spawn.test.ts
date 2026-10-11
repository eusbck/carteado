import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Aboleth Spawn';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('copia a habilidade de entrar da criatura do oponente, e a cópia resolve primeiro', () => {
    // Wall of Omens: quando entra, compre uma carta
    const tg = setup({ active: 1, battlefield: [[N], ['Plains', 'Plains']], hand: [[], ['Wall of Omens']], library: [ilhas, ilhas] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 3]);
    expect(hasKw(tg.g, id, 'flash')).toBe(true);
    expect(hasKw(tg.g, id, 'ward')).toBe(true);
    tg.yes('Aboleth Spawn', true);
    tg.cast('Wall of Omens').resolve();
    // na pilha: a habilidade de Wall of Omens e, acima dela, a de Aboleth Spawn
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    // a cópia ficou no topo
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.names(1, 'hand')).toHaveLength(0);
    tg.resolveAll();
    expect(tg.names(1, 'hand')).toHaveLength(1);
  });

  it('recusando, nada é copiado', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Plains', 'Plains']], hand: [[], ['Wall of Omens']], library: [ilhas, ilhas] });
    tg.yes('Aboleth Spawn', false);
    tg.cast('Wall of Omens').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(0);
    expect(tg.names(1, 'hand')).toHaveLength(1);
  });

  it('habilidade de outra permanente que dispara com a entrada da criatura não é copiada', () => {
    // Impact Tremors: sempre que uma criatura que você controla entra, causa 1 de dano a cada oponente
    const tg = setup({ active: 1, battlefield: [[N], ['Plains', 'Plains', 'Impact Tremors']], hand: [[], ['Silver Myr']], library: [ilhas, ilhas] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Aboleth Spawn: copiar')) throw new Error('não devia oferecer'); return null; });
    tg.cast('Silver Myr').resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(tg.life(1)).toBe(40);
  });

  it('criatura que entra sob o seu controle não conta', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], []], hand: [['Wall of Omens'], []], library: [ilhas, ilhas] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Aboleth Spawn: copiar')) throw new Error('não devia oferecer'); return null; });
    tg.cast('Wall of Omens').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });
});
