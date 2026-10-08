import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { createTokens } from '../../motor/api.ts';
import { buildView } from '../../motor/view.ts';

const ELSPETH = "Elspeth, Sun's Champion";

describe(ELSPETH, () => {
  it('+1: cria três fichas Soldier brancas 1/1', () => {
    const tg = setup({ battlefield: [[ELSPETH], []] });
    tg.activate(ELSPETH, '+1').resolve();
    const soldados = tg.all('Soldier');
    expect(soldados.length).toBe(3);
    for (const id of soldados) {
      expect(tg.pt(id)).toEqual([1, 1]);
      expect(chars(tg.g, id).colors).toEqual(['W']);
      expect(tg.state.objects[id].controller).toBe(0);
    }
    expect(tg.state.objects[tg.bf(ELSPETH)].counters.loyalty).toBe(5);
  });

  it('−3: destrói todas as criaturas com força 4 ou mais, dos dois lados; indestrutível fica', () => {
    const tg = setup({
      battlefield: [[ELSPETH, 'Goldspan Dragon', 'Wall of Omens'], ['Zetalpa, Primal Dawn', 'Indomitable Ancients', 'Village Pillagers']],
    });
    tg.activate(ELSPETH, '−3').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Goldspan Dragon']);
    expect(tg.names(1, 'graveyard')).toEqual(['Village Pillagers']);
    expect(tg.names(0, 'battlefield').sort()).toEqual([ELSPETH, 'Wall of Omens']);
    expect(tg.names(1, 'battlefield').sort()).toEqual(['Indomitable Ancients', 'Zetalpa, Primal Dawn']);
    expect(tg.state.objects[tg.bf(ELSPETH)].counters.loyalty).toBe(1);
  });

  it('−7: emblema na zona de comando; suas criaturas recebem +2/+2 e voar, também as que entram depois', () => {
    const tg = setup({ battlefield: [[{ name: ELSPETH, counters: { loyalty: 7 } }, 'Wall of Omens'], ['Indomitable Ancients']] });
    tg.activate(ELSPETH, '−7').resolve();
    // Elspeth fica com 0 de lealdade e vai para o cemitério (CR 704.5i); o emblema continua (CR 114.4)
    expect(tg.names(0, 'graveyard')).toEqual([ELSPETH]);
    const em = tg.find('Emblema de Elspeth', 'command');
    expect(em).not.toBeNull();
    expect(tg.state.objects[em!].owner).toBe(0);
    expect(chars(tg.g, em!).types).toEqual([]);
    const parede = tg.bf('Wall of Omens');
    expect(tg.pt(parede)).toEqual([2, 6]);
    expect(hasKw(tg.g, parede, 'flying')).toBe(true);
    // as criaturas de Bruno não mudam
    const ancients = tg.bf('Indomitable Ancients');
    expect(tg.pt(ancients)).toEqual([2, 10]);
    expect(hasKw(tg.g, ancients, 'flying')).toBe(false);
    const [soldado] = tg.run(createTokens(tg.g, 0, 'Soldier', 1));
    expect(tg.pt(soldado)).toEqual([3, 3]);
    expect(hasKw(tg.g, soldado, 'flying')).toBe(true);
    // a mesa recebe o emblema na zona de comando, marcado como emblema e com o texto da habilidade
    const v = buildView(tg.g, 1, null).command.find((o) => o.id === em);
    expect(v?.emblem).toBe(true);
    expect(v?.abilities).toEqual(['As criaturas que você controla recebem +2/+2 e têm voar.']);
  });
});
