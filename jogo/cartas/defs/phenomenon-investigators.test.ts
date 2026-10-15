import { describe, expect, it } from 'vitest';
import { enterCard } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const PI = 'Phenomenon Investigators';
const mana = ['Island', 'Island', 'Swamp', 'Swamp'];

describe(PI, () => {
  it('Acreditar: sempre que uma criatura sua que não é ficha morre, cria um Horror 2/2', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Island', 'Swamp', 'Swamp', 'Wall of Omens', { name: 'Angel', token: true }], ['Indomitable Ancients']], hand: [['Time Wipe'], []], library: [['Island'], []] });
    tg.choose('escolha Acreditar ou Duvidar', ['acreditar']);
    enterCard(tg, PI, 0);
    // Time Wipe devolve a Wall e destrói o resto (Investigators, o Angel e a do oponente)
    tg.choose('devolver à mão', ['Wall of Omens']);
    tg.cast('Time Wipe');
    while (tg.state.zones.stack.length) tg.resolve();
    // só a Investigators (não é ficha, é sua) conta: o Angel é ficha e a Ancients é do oponente
    expect(tg.all('Horror')).toHaveLength(1);
  });

  it('Duvidar: na sua etapa final, devolve uma permanente sua para a mão e compra uma carta', () => {
    const tg = setup({ battlefield: [[...mana, 'Sol Ring'], []], hand: [[PI], []], library: [['Island', 'Forest'], ['Island']] });
    tg.choose('escolha Acreditar ou Duvidar', ['duvidar']);
    tg.cast(PI).resolveAll();
    tg.choose('devolver uma permanente não terreno sua', ['Sol Ring']);
    tg.passTo('end');
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring', 'Island']);
  });

  it('posta no campo sem a escolha (cópia sem "ao entrar"), não tem nenhuma das duas habilidades', () => {
    const tg = setup({ battlefield: [[], []], library: [['Island'], ['Island']] });
    const id = enterCard(tg, PI, 0)!;
    // a entrada pergunta a escolha; simulamos a cópia que não escolheu nada
    delete tg.state.objects[id].choices.crenca;
    tg.g.bump();
    tg.refresh();
    tg.passTo('end');
    expect(tg.state.zones.stack).toHaveLength(0);
  });
});
