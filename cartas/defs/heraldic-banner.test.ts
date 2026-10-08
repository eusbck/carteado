import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { manaOptions } from '../../motor/costs.ts';

const NOME = 'Heraldic Banner';

describe(NOME, () => {
  it('a escolha oferece só as cinco cores; criaturas suas da cor recebem +1/+0 e ele produz essa cor', () => {
    const tg = setup({
      battlefield: [['Sol Ring', 'Swamp', 'Viscera Seer', 'Elvish Mystic'], ['Hateful Eidolon']],
      hand: [[NOME], []],
    });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Heraldic Banner: escolha uma cor') ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: ['B'] }) : null));
    tg.cast(NOME).resolve();
    expect(opcoes).toEqual(['branco', 'azul', 'preto', 'vermelho', 'verde']);
    expect(tg.pt(tg.bf('Viscera Seer'))).toEqual([2, 1]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]); // verde: não
    expect(tg.pt(tg.bf('Hateful Eidolon'))).toEqual([1, 2]); // do oponente: não
    const banner = tg.bf(NOME);
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === banner).map((o) => o.alt.join(''))).toEqual(['B']);
  });

  it('sem cor escolhida, não dá +1/+0 nem produz mana', () => {
    // posto no campo sem passar pela substituição de "ao entrar" (estado montado direto)
    const tg = setup({ battlefield: [[NOME, 'Viscera Seer'], []] });
    expect(tg.pt(tg.bf('Viscera Seer'))).toEqual([1, 1]);
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === tg.bf(NOME))).toEqual([]);
  });
});
