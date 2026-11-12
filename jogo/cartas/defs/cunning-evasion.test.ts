import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cunning Evasion';

describe(N, () => {
  it('a criatura bloqueada volta para a mão antes do dano e não causa nem recebe dano de combate', () => {
    const tg = setup({ battlefield: [[N, 'Memnite', 'Ornithopter'], ['Indomitable Ancients']] });
    tg.yes('Cunning Evasion', true);
    tg.attack([['Memnite', 1], ['Ornithopter', 1]]).block([['Indomitable Ancients', 'Memnite']]).passTo('main2', 0);
    expect(tg.find('Memnite', 'hand', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
    // Ornithopter (0/2) não foi bloqueado: continua no campo
    expect(tg.find('Ornithopter')).not.toBeNull();
  });
});
