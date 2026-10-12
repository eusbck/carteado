import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Everything Pizza';

describe(N, () => {
  it('ao entrar, busca um terreno básico para a mão', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [['Sol Ring', 'Island', 'Sol Ring'], ['Island']] });
    tg.choose('terreno básico', ['Island']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('sacrificada: o jogador alvo ganha 3 e compra, cada oponente descarta, 3 de dano e três marcadores +1/+1', () => {
    const tg = setup({
      battlefield: [[N, 'Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Forest', 'Forest', 'Indomitable Ancients'], ['Elvish Mystic']],
      hand: [[], ['Island']], library: [['Island', 'Island'], ['Island', 'Island']],
    });
    const vidas = tg.life(0) + tg.life(1);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('ganha 3 de vida') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.choose('qualquer alvo para os 3 de dano', ['Elvish Mystic']).choose('criatura alvo que recebe os marcadores', ['Indomitable Ancients']);
    tg.activate(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.life(0) + tg.life(1)).toBe(vidas + 3);
    expect(tg.names(0, 'hand').length + tg.names(1, 'hand').length).toBe(1);
    expect(tg.names(1, 'graveyard')).toContain('Island');
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([5, 13]);
  });
});