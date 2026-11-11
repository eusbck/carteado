import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'S.S. Botany Bay';

describe(N, () => {
  it('{T}: o oponente exila uma carta do cemitério e você pode exilar uma sua; com 8+, o dano de combate devolve as suas criaturas exiladas', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Elder Gargaroth'], ['Wall of Omens']] });
    tg.choose('você pode exilar', ['Elder Gargaroth']);
    tg.activate(N).resolveAll();
    expect(tg.find('Wall of Omens', 'exile')).not.toBeNull();
    expect(tg.find('Elder Gargaroth', 'exile')).not.toBeNull();

    const nave = tg.state.objects[tg.bf(N)];
    nave.counters.charge = 8;
    nave.tapped = false;
    tg.refresh();
    tg.attack([[N, 1]]).passTo('main2', 0);
    tg.resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.find('Elder Gargaroth', 'battlefield')).not.toBeNull();
    // a do oponente continua exilada
    expect(tg.find('Wall of Omens', 'exile')).not.toBeNull();
  });
});
