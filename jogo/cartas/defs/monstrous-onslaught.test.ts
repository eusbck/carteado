import { describe, expect, it } from 'vitest';
import { untilEndOfTurn } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Monstrous Onslaught';
const terrenos = Array(5).fill('Forest');

describe(N, () => {
  it('divide a maior força entre as criaturas alvo, com pelo menos 1 para cada', () => {
    const tg = setup({ battlefield: [['Ripjaw Raptor', 'Indomitable Ancients', ...terrenos], ['Elvish Mystic', 'Wall of Omens']], hand: [[N], []] });
    let minimo = -1;
    tg.choose('criaturas alvo do dano dividido', ['Elvish Mystic', 'Wall of Omens']);
    tg.script.push((d) => (d.kind === 'number' && d.prompt.includes('quanto para') ? (minimo = d.min, { kind: 'number', value: 1 }) : null));
    tg.cast(N).resolve();
    expect(minimo).toBe(1);
    expect(tg.find('Elvish Mystic')).toBeNull();
    // Wall of Omens 0/4 recebe os outros 3
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(3);
  });

  it('X é a maior força ao conjurar, mesmo que ela mude antes de resolver', () => {
    const tg = setup({ battlefield: [['Ripjaw Raptor', ...terrenos], ['Wall of Omens']], hand: [[N], []] });
    tg.choose('criaturas alvo do dano dividido', ['Wall of Omens']).cast(N);
    untilEndOfTurn({ g: tg.g, you: 0, source: tg.bf('Ripjaw Raptor') }, [tg.bf('Ripjaw Raptor')], [{ k: 'pt', p: -3, t: 0 }]);
    tg.refresh();
    tg.resolve();
    // os 4 de dano (a força ao conjurar) matam a Wall of Omens 0/4; com a força de agora (1), ela sobreviveria
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
