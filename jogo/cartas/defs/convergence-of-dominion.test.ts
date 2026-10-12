import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Convergence of Dominion';

describe(N, () => {
  it('controlando o seu comandante, as habilidades das cartas do seu cemitério custam {2} a menos, nunca menos de uma mana', () => {
    // Chronomancer: desenterrar {2}{B} passa a custar {B}; Canoptek Tomb Sentinel: {7} passa a custar {5}
    const tg = setup({ battlefield: [[N, 'Swamp', { name: 'Silver Myr', commander: true }], []], graveyard: [['Chronomancer'], []] });
    tg.state.objects[tg.bf('Silver Myr')].tapped = true;
    tg.refresh();
    tg.activate('Chronomancer', 'Desenterrar').resolveAll();
    expect(tg.find('Chronomancer')).not.toBeNull();
    const sem = setup({ battlefield: [[N, 'Swamp', { name: 'Silver Myr', tapped: true }], []], graveyard: [['Chronomancer'], []] });
    expect(() => sem.activate('Chronomancer', 'Desenterrar')).toThrow();
  });

  it('{3}, {T}: tritura três cartas', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp'], []], library: [Array(4).fill('Island'), ['Island']] });
    tg.activate(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toHaveLength(3);
  });
});