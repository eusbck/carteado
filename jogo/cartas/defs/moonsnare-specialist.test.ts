import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Moonsnare Specialist';

describe(N, () => {
  it('entra pelo ninjutsu e devolve a criatura que bloqueou', () => {
    const tg = setup({ battlefield: [['Memnite', 'Mist-Cloaked Herald', 'Island', 'Island', 'Island'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.attack([['Memnite', 1], ['Mist-Cloaked Herald', 1]]).block([['Indomitable Ancients', 'Memnite']]).passTo('declareBlockers');
    tg.choose('até uma criatura alvo', ['Indomitable Ancients']);
    tg.activate(N, 'Ninjutsu').resolveAll();
    expect(tg.find('Indomitable Ancients', 'hand', 1)).not.toBeNull();
    expect(tg.find('Mist-Cloaked Herald', 'hand', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
