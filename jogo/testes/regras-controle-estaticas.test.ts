// CR 613.1b e 613.6: os efeitos de controle são aplicados na camada 2, antes das outras. Uma habilidade estática de
// um permanente que mudou de controlador passa a valer para quem o controla agora: "você" é o controlador atual.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import { gainControl } from '../motor/api.ts';
import { hooks } from '../motor/chars.ts';
import { fixture as setup } from './artefatos.ts';

describe('estáticas de um permanente que mudou de controlador', () => {
  it('"criaturas que você controla" segue o controlador atual da fonte', () => {
    // Forsaken Monument: criaturas incolores que você controla recebem +2/+2
    const tg = setup({ battlefield: [['Forsaken Monument', 'Silver Myr'], ['Silver Myr']] });
    const [meu, dele] = [tg.bf('Silver Myr', 0), tg.bf('Silver Myr', 1)];
    expect(tg.pt(meu)).toEqual([3, 3]);
    expect(tg.pt(dele)).toEqual([1, 1]);
    gainControl(tg.g, tg.bf('Forsaken Monument'), 1, { kind: 'permanent' }, dele);
    tg.refresh();
    expect(tg.pt(meu)).toEqual([1, 1]);
    expect(tg.pt(dele)).toEqual([3, 3]);
  });

  it('os ganchos de regra da estática também passam ao controlador atual', () => {
    const tg = setup({ battlefield: [['Forsaken Monument'], ['Silver Myr']] });
    expect(hooks(tg.g, 'extraManaForPlanning').map((h) => h.ctx.you)).toEqual([0]);
    gainControl(tg.g, tg.bf('Forsaken Monument'), 1, { kind: 'permanent' }, tg.bf('Silver Myr'));
    tg.refresh();
    expect(hooks(tg.g, 'extraManaForPlanning').map((h) => h.ctx.you)).toEqual([1]);
  });
});
