import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dogged Detective';

describe(N, () => {
  it('quando entra, vigiar 2', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[N], []], library: [['Plains', 'Island', 'Forest'], Array(10).fill('Forest')] });
    let vigiou = false;
    tg.script.push((d) => { if (d.kind !== 'priority' && d.kind !== 'payment' && /vigi|cemitério|topo/i.test(d.prompt)) vigiou = true; return null; });
    tg.cast(N).resolveAll();
    expect(vigiou).toBe(true);
    expect(tg.pt(tg.bf(N))).toEqual([2, 1]);
    // as duas cartas olhadas ficaram no topo ou foram para o cemitério; nenhuma foi para a mão
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.state.zones.library[0].length + tg.state.zones.graveyard[0].length).toBe(3);
  });

  it('no cemitério, quando um oponente compra a segunda carta do turno, pode voltar para a mão', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [[N], []] });
    tg.yes(N, true);
    // a primeira compra do oponente não dispara
    tg.run(draw(tg.g, 1, 1));
    tg.resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    tg.run(draw(tg.g, 1, 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([N]);
  });

  it('é opcional, e a sua própria segunda compra não dispara', () => {
    const tg = setup({ battlefield: [[], []], graveyard: [[N], []] });
    tg.run(draw(tg.g, 0, 2));
    tg.resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    tg.yes(N, false);
    tg.run(draw(tg.g, 1, 2));
    tg.resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
