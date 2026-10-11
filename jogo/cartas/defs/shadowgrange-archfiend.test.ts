import { describe, expect, it } from 'vitest';
import { discard } from '../../motor/actions.ts';
import { enterCard, fixture } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Shadowgrange Archfiend';

describe(N, () => {
  it('cada oponente sacrifica a criatura de maior força; você ganha vida igual à maior força entre as sacrificadas', () => {
    // Bruno: Zetalpa (4) e Elvish Mystic (1); Carla: Indomitable Ancients (2)
    const tg = fixture({ players: 3, battlefield: [['Elvish Mystic'], ['Zetalpa, Primal Dawn', 'Elvish Mystic'], ['Indomitable Ancients']] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    // as criaturas mais fracas e as suas ficam
    expect(tg.find('Elvish Mystic', 'battlefield', 1)).not.toBeNull();
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull();
    expect(tg.life(0)).toBe(44);
  });

  it('no empate de força, o oponente escolhe qual sacrificar', () => {
    const tg = fixture({ battlefield: [[], ['Wall of Omens', 'Elvish Mystic', 'Silver Myr']] });
    let quem = -1;
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith(N)) return null;
      quem = d.player;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Silver Myr')!.id] };
    });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(quem).toBe(1);
    expect(opcoes.sort()).toEqual(['Elvish Mystic', 'Silver Myr']);
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.life(0)).toBe(41);
  });

  it('oponente sem criaturas não sacrifica, e sem sacrifício você não ganha vida', () => {
    const tg = fixture({ battlefield: [[], []] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(40);
  });

  it('conjurada pela loucura no turno de outro jogador, paga {2}{B} e 8 de vida', () => {
    const tg = setup({ active: 1, battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []] });
    tg.yes('Loucura', true);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find(N)).not.toBeNull();
    expect(tg.life(0)).toBe(32);
    expect(tg.all('Swamp').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });

  it('sem conjurar, vai para o cemitério', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []] });
    tg.yes('Loucura', false);
    tg.run(discard(tg.g, 0, 1));
    tg.resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.life(0)).toBe(40);
  });
});
