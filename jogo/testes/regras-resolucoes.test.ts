// lote4-b: "se esta é a N-ésima vez que esta habilidade resolveu neste turno" (motor/resolucoes.ts): contagem do objeto
// (CR 400.7: quem sai do campo e volta é um objeto novo) e do turno.
import { describe, expect, it } from 'vitest';
import { contaResolucao, resolucoesNoTurno } from '../motor/api.ts';
import { setup } from './harness.ts';

describe('contagem de resoluções por objeto e por turno', () => {
  it('conta cada resolução no turno e recomeça no turno seguinte', () => {
    const tg = setup({ battlefield: [['Wall of Omens'], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    const id = tg.bf('Wall of Omens');
    expect(contaResolucao(tg.g, id, 'x')).toBe(1);
    expect(contaResolucao(tg.g, id, 'x')).toBe(2);
    expect(contaResolucao(tg.g, id, 'y')).toBe(1);
    expect(resolucoesNoTurno(tg.g, id, 'x')).toBe(2);
    tg.passTo('upkeep', 1);
    expect(resolucoesNoTurno(tg.g, id, 'x')).toBe(0);
    expect(contaResolucao(tg.g, id, 'x')).toBe(1);
  });

  it('CR 400.7: a fonte que saiu do campo não conta (o objeto novo começa do zero)', () => {
    const tg = setup({ battlefield: [['Wall of Omens'], []] });
    const id = tg.bf('Wall of Omens');
    contaResolucao(tg.g, id, 'x');
    tg.state.objects[id].zone = 'graveyard';
    expect(contaResolucao(tg.g, id, 'x')).toBe(0);
  });
});
