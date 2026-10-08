import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Blowfly Infestation', () => {
  it('um marcador só, quantos a criatura tivesse; é obrigatório (alvo sua se só você tiver criaturas)', () => {
    const tg = setup({ battlefield: [['Blowfly Infestation', 'Indomitable Ancients', 'Elvish Mystic', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Blight Rot'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Blight Rot').resolve();
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['-1/-1']).toBe(1);
  });
  it('sem marcador -1/-1, não dispara', () => {
    const tg = setup({ battlefield: [['Blowfly Infestation', 'Elvish Mystic', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Infernal Grasp').resolve();
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
