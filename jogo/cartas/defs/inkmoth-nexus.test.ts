import { describe, expect, it } from 'vitest';
import { hasKw, isCreature, isLand } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Inkmoth Nexus';

describe(N, () => {
  it('{1}: vira criatura artefato 1/1 com voar e infectar até o fim do turno, e continua terreno', () => {
    const tg = setup({ battlefield: [[N, 'Plains'], []] });
    const id = tg.bf(N);
    tg.activate(N, 'se torna').resolveAll();
    expect(isCreature(tg.g, id)).toBe(true);
    expect(isLand(tg.g, id)).toBe(true);
    expect(tg.pt(id)).toEqual([1, 1]);
    for (const kw of ['flying', 'infect']) expect(hasKw(tg.g, id, kw)).toBe(true);
    // o pagamento automático pode ter virado o próprio Nexus para o {1}
    tg.state.objects[id].tapped = false;
    tg.refresh();
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.state.players[1].counters.poison).toBe(1);
    tg.passTo('upkeep', 1);
    expect(isCreature(tg.g, id)).toBe(false);
  });
});