import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dora Milaje Elite';

describe(N, () => {
  it('iniciativa; entrando com um oponente com mais terrenos, cria um Vibranium virado', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Island', 'Island', 'Island']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(hasKw(tg.g, tg.bf(N), 'first strike')).toBe(true);
    expect(tg.state.objects[tg.bf('Vibranium')].tapped).toBe(true);
    const sem = setup({ battlefield: [['Plains', 'Plains'], ['Island']], hand: [[N], []] });
    sem.cast(N).resolveAll();
    expect(sem.find('Vibranium')).toBeNull();
  });

  it('sacrificada, as permanentes lendárias que você controla ganham indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Zetalpa, Primal Dawn', 'Silver Myr', 'Shuri, the Black Panther'], []] });
    tg.activate(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(hasKw(tg.g, tg.bf('Shuri, the Black Panther'), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Silver Myr'), 'indestructible')).toBe(false);
  });
});