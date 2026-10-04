import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Chaos Warp', () => {
  it('o dono embaralha o permanente no grimório e põe no campo a carta de permanente revelada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], ['Zetalpa, Primal Dawn']], hand: [['Chaos Warp'], []], library: [[], []] });
    tg.choose('permanente alvo', ['Zetalpa, Primal Dawn']).cast('Chaos Warp').resolve();
    // o grimório só tinha a própria Zetalpa: ela é revelada e volta ao campo
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.state.zones.library[1].length).toBe(0);
  });
  it('se a carta revelada não é de permanente, fica no topo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], ['Sol Ring']], hand: [['Chaos Warp'], []], library: [[], ['Counterspell', 'Counterspell', 'Counterspell']] });
    tg.choose('permanente alvo', ['Sol Ring']).cast('Chaos Warp').resolve();
    expect(tg.state.zones.library[1].length).toBe(4);
    const top = tg.state.zones.library[1][0];
    expect(tg.names(1, 'battlefield')).not.toContain(tg.state.objects[top].def);
  });
  it('ficha embaralhada deixa de existir e o dono embaralha antes de revelar', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], []], hand: [['Chaos Warp'], []], library: [[], ['Wall of Omens']] });
    tg.run(createTokens(tg.g, 1, 'Saproling', 1));
    tg.choose('permanente alvo', ['Saproling']).cast('Chaos Warp').resolve();
    expect(tg.find('Saproling')).toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});
