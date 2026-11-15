import { describe, expect, it } from 'vitest';
import { destroy, sacrifice } from '../../motor/api.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Biotech Specialist';

describe(N, () => {
  it('entra criando Lander; sacrificar o Lander causa 2 ao oponente e busca um básico virado', () => {
    const tg = setup({ battlefield: [['Forest', 'Mountain'], []], library: [['Swamp', 'Forest'], []] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.all('Lander')).toHaveLength(1);
    tg.choose('terreno básico', ['Swamp']).activate('Lander').resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
    expect(tg.find('Lander')).toBeNull();
  });
  it('dispara por cada artefato sacrificado, incluindo fichas e criaturas artefato', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Silver Myr', { name: 'Treasure', token: true }], []] });
    tg.run(sacrifice(tg.g, [tg.bf('Sol Ring'), tg.bf('Silver Myr'), tg.bf('Treasure')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(34);
  });
  it('não dispara por destruição, por sacrifício alheio ou por criatura sem tipo artefato', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Elvish Mystic'], ['Sol Ring']] });
    tg.run(destroy(tg.g, [tg.bf('Sol Ring', 0)]));
    tg.run(sacrifice(tg.g, [tg.bf('Sol Ring', 1), tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(40);
  });
  it('a habilidade causa dano mesmo se a fonte sair antes da resolução', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] });
    tg.run(sacrifice(tg.g, [tg.bf('Sol Ring')]));
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
  });
});
