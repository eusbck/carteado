import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cleansing Beam';
const montanhas = Array(5).fill('Mountain');
const dano = (tg: ReturnType<typeof setup>, nome: string) => tg.state.objects[tg.bf(nome)].damage;

describe(N, () => {
  it('2 de dano à criatura alvo e a cada outra que compartilha uma cor com ela, inclusive as suas', () => {
    const tg = setup({ battlefield: [[...montanhas, 'Indomitable Ancients', 'Oros, the Avenger'], ['Serra Angel', 'Reiver Demon']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Serra Angel']).cast(N).resolveAll();
    expect(dano(tg, 'Serra Angel')).toBe(2);
    expect(dano(tg, 'Indomitable Ancients')).toBe(2);
    expect(dano(tg, 'Oros, the Avenger')).toBe(2);
    // Reiver Demon é preto: não compartilha cor com Serra Angel
    expect(dano(tg, 'Reiver Demon')).toBe(0);
  });

  it('mirando uma criatura incolor, só ela leva dano', () => {
    const tg = setup({ battlefield: [[...montanhas, 'Indomitable Ancients'], ['Darksteel Juggernaut', 'Silver Myr']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Silver Myr']).cast(N).resolveAll();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(dano(tg, 'Indomitable Ancients')).toBe(0);
    expect(dano(tg, 'Darksteel Juggernaut')).toBe(0);
  });
});