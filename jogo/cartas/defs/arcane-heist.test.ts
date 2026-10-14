import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Arcane Heist';
const montar = () => setup({
  battlefield: [['Island', 'Island', 'Island', 'Island', 'Slither Blade'], []], hand: [[N], []],
  graveyard: [[], ['Rampant Growth', "Kodama's Reach"]], library: [['Forest', 'Forest', 'Island', 'Plains', ...Array(8).fill('Swamp')], Array(8).fill('Island')],
});

describe(N, () => {
  it('conjura a carta do cemitério do oponente de graça; ela é exilada depois de resolver; codificada, Arcane Heist vai da pilha para o exílio', () => {
    const tg = montar();
    tg.choose('carta de instantânea ou feitiço alvo', ['Rampant Growth']).yes('Arcane Heist: conjurar', true).choose('Procure uma carta de terreno básico', ['Forest']);
    tg.yes('Cifra: codificar', true).choose('Cifra: escolha a criatura', ['Slither Blade']);
    tg.cast(N).resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Forest')).toHaveLength(1);
    expect(tg.find('Rampant Growth', 'exile')).not.toBeNull();
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(1, 'graveyard')).toEqual(["Kodama's Reach"]);
  });

  it('quando a criatura codificada causa dano de combate, você conjura uma cópia de graça', () => {
    const tg = montar();
    tg.choose('carta de instantânea ou feitiço alvo', ['Rampant Growth']).yes('Arcane Heist: conjurar', false);
    tg.yes('Cifra: codificar', true).choose('Cifra: escolha a criatura', ['Slither Blade']);
    tg.cast(N).resolveAll();
    expect(tg.names(1, 'graveyard').sort()).toEqual(["Kodama's Reach", 'Rampant Growth']);
    // a cópia mira Kodama's Reach e a conjura
    tg.yes('Cifra: conjurar uma cópia', true).choose('carta de instantânea ou feitiço alvo', ["Kodama's Reach"]).yes('Arcane Heist: conjurar', true);
    tg.attack([['Slither Blade', 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(39);
    expect(tg.find("Kodama's Reach", 'exile')).not.toBeNull();
    // a carta codificada continua no exílio; a cópia sumiu
    expect(tg.all(N, 'exile')).toHaveLength(1);
  });

  it('se a criatura sai do campo, a carta deixa de estar codificada', () => {
    const tg = montar();
    tg.choose('carta de instantânea ou feitiço alvo', ['Rampant Growth']).yes('Arcane Heist: conjurar', false);
    tg.yes('Cifra: codificar', true).choose('Cifra: escolha a criatura', ['Slither Blade']);
    tg.cast(N).resolveAll();
    const blade = tg.bf('Slither Blade');
    expect(tg.g.state.objects[blade].linked.cifra).toHaveLength(1);
    removeCard(tg, blade);
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.state.zones.battlefield.some((id) => hasKw(tg.g, id, 'cipher'))).toBe(false);
    expect(tg.state.effects.some((e) => e.affected?.includes(blade))).toBe(false);
  });
});
