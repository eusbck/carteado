import { describe, expect, it } from 'vitest';
import { hasKw, nameOf } from '../../motor/chars.ts';
import { buildView } from '../../motor/view.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Vesuvan Drifter';
const ilhas = Array(6).fill('Island');

describe(N, () => {
  it('você pode olhar a carta do topo do seu grimório a qualquer momento', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', ...ilhas], ilhas] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(buildView(tg.g, 0, null).players[0].topCard?.name).toBe('Sol Ring');
    expect(buildView(tg.g, 1, null).players[0].topCard).toBeUndefined();
  });

  it('revelando uma carta de criatura, vira uma cópia dela com voar até o fim do turno', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Indomitable Ancients', ...ilhas], ilhas] });
    const id = tg.bf(N);
    const original = tg.pt(id);
    tg.yes('Vesuvan Drifter', true);
    tg.passTo('beginCombat', 0);
    expect(nameOf(tg.g, id)).toBe('Indomitable Ancients');
    expect(tg.pt(id)).toEqual([2, 10]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    // a carta revelada continua no topo do grimório
    expect(tg.names(0, 'library')[0]).toBe('Indomitable Ancients');
    tg.passTo('upkeep', 1);
    expect(nameOf(tg.g, id)).toBe(N);
    expect(tg.pt(id)).toEqual(original);
  });

  it('enquanto é cópia de outra carta, não tem as próprias habilidades', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Indomitable Ancients', ...ilhas], ilhas] });
    tg.yes('Vesuvan Drifter', true);
    tg.passTo('beginCombat', 0);
    expect(buildView(tg.g, 0, null).players[0].topCard).toBeUndefined();
  });

  it('os marcadores que já estavam nela continuam valendo', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }], []], library: [['Indomitable Ancients', ...ilhas], ilhas] });
    tg.yes('Vesuvan Drifter', true);
    tg.passTo('beginCombat', 0);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
  });

  it('carta que não é de criatura, ou recusando revelar, nada muda; vale no combate de qualquer jogador', () => {
    const terreno = setup({ battlefield: [[N], []], library: [ilhas, ilhas] });
    terreno.yes('Vesuvan Drifter', true);
    terreno.passTo('beginCombat', 0);
    expect(nameOf(terreno.g, terreno.bf(N))).toBe(N);
    const recusa = setup({ battlefield: [[N], []], library: [['Indomitable Ancients', ...ilhas], ilhas] });
    recusa.yes('Vesuvan Drifter', false);
    recusa.passTo('beginCombat', 0);
    expect(nameOf(recusa.g, recusa.bf(N))).toBe(N);
    // no combate do oponente (a carta do topo é a mesma: você não compra no turno dele)
    const outro = setup({ active: 1, battlefield: [[N], []], library: [['Indomitable Ancients', ...ilhas], ilhas] });
    const id = outro.bf(N);
    outro.yes('Vesuvan Drifter', true);
    outro.passTo('beginCombat', 1);
    expect(nameOf(outro.g, id)).toBe('Indomitable Ancients');
  });
});
