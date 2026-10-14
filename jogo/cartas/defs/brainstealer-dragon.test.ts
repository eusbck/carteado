import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Brainstealer Dragon';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('na sua etapa final, exila o topo de cada oponente; você joga essas cartas depois, e o dono perde vida igual ao valor de mana', () => {
    const tg = setup({
      players: 3, battlefield: [[N, 'Island', 'Island', 'Island'], [], []],
      library: [ilhas, ['Prismatic Lens', ...ilhas], ['Swamp', ...ilhas]],
    });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    tg.passTo('end', 0);
    tg.resolveAll();
    const lente = tg.find('Prismatic Lens', 'exile')!;
    const pantano = tg.find('Swamp', 'exile')!;
    expect(lente).not.toBeNull();
    expect(pantano).not.toBeNull();
    // no próximo turno de Ana: joga o Swamp de Carla e conjura a Lens de Bruno
    tg.passTo('main1', 1).passTo('main1', 0);
    const jogar = tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(pantano)))!;
    tg.answer({ kind: 'priority', action: jogar });
    tg.settle();
    const conjurar = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(lente)))!;
    tg.answer({ kind: 'priority', action: conjurar });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Prismatic Lens')].controller).toBe(0);
    // Bruno perde 2 (valor de mana da Lens); o terreno de Carla não faz perder vida
    expect(tg.life(1)).toBe(38);
    expect(tg.life(2)).toBe(40);
  });
});
