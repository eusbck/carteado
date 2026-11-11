import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Disallow', () => {
  it('anula uma habilidade ativada na pilha', () => {
    const tg = setup({ battlefield: [['Academy Ruins', ...Array(5).fill('Island')], []], hand: [['Disallow'], []], graveyard: [['Sol Ring'], []], library: [['Opt'], []] });
    tg.choose('carta de artefato', ['Sol Ring']).activate('Academy Ruins', '{1}{U}');
    tg.choose('mágica, habilidade', [/* a habilidade */ tg.state.zones.stack[0]]).cast('Disallow').resolveAll();
    expect(tg.names(0, 'graveyard')).toContain('Sol Ring');
  });
});
