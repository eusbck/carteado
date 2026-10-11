import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Excavation Technique';
const planicies = ['Plains', 'Plains', 'Plains', 'Plains'];

describe(N, () => {
  it('sem demonstrar, só a original resolve', () => {
    const tg = setup({ battlefield: [planicies, ['Sol Ring', 'Silver Myr']], hand: [[N], []] });
    tg.choose('alvo', ['Sol Ring']);
    tg.yes('Demonstrar', false);
    tg.cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
    const tesouros = tg.all('Treasure');
    expect(tesouros).toHaveLength(2);
    for (const id of tesouros) expect(tg.state.objects[id].controller).toBe(1);
  });

  it('demonstrando, a cópia do oponente resolve primeiro, depois a sua, depois a original', () => {
    const tg = setup({ battlefield: [[...planicies, 'Darksteel Ingot', 'Elvish Mystic'], ['Sol Ring', 'Silver Myr']], hand: [[N], []] });
    tg.choose('alvo', ['Sol Ring']);
    tg.yes('Demonstrar', true);
    // a sua cópia mira Silver Myr; a cópia do oponente mira a sua Elvish Mystic
    tg.yes('novos alvos', true).choose('alvo', ['Silver Myr']);
    tg.yes('novos alvos', true).choose('alvo', ['Elvish Mystic']);
    tg.cast(N).resolve();
    expect(tg.state.zones.stack).toHaveLength(3);
    tg.resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
    tg.resolve();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
    tg.resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    // dois Treasures para o controlador de cada permanente destruída
    expect(tg.all('Treasure').filter((id) => tg.state.objects[id].controller === 1)).toHaveLength(4);
    expect(tg.all('Treasure').filter((id) => tg.state.objects[id].controller === 0)).toHaveLength(2);
  });
});