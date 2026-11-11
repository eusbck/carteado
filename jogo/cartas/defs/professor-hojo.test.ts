import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Professor Hojo';
const ativavel = (tg: ReturnType<typeof setup>, nome: string) => tg.actionIds().some((a) => a.startsWith(`act:${tg.bf(nome)}:`));

describe(N, () => {
  it('equipar é habilidade ativada: a primeira do seu turno com alvo numa criatura sua custa {2} a menos', () => {
    const tg = setup({ battlefield: [[N, 'Shadowspear', 'Swiftfoot Boots', 'Indomitable Ancients', 'Plains'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate('Shadowspear', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf('Indomitable Ancients'));
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(false);
    // a segunda paga o custo inteiro ({1})
    tg.activate('Swiftfoot Boots', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
  });

  it('só reduz a mana genérica: equipar {1} fica {0}, sem sobra para outra habilidade', () => {
    const tg = setup({ battlefield: [[N, 'Shadowspear', 'Swiftfoot Boots', 'Indomitable Ancients'], []] });
    tg.activate('Swiftfoot Boots', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Swiftfoot Boots')].attachedTo).not.toBeNull();
    expect(ativavel(tg, 'Shadowspear')).toBe(false);
  });

  it('no turno do oponente não reduz', () => {
    const tg = setup({ battlefield: [[N, 'Zack Fair', 'Indomitable Ancients'], []] });
    // no seu turno, {1} de Zack Fair fica {0}
    expect(ativavel(tg, 'Zack Fair')).toBe(true);
    tg.passTo('upkeep', 1);
    while (tg.pending?.player !== 0) tg.pass();
    expect(ativavel(tg, 'Zack Fair')).toBe(false);
  });

  it('a compra resolve antes da habilidade ativada, e só uma vez por turno', () => {
    const tg = setup({ battlefield: [[N, 'Shadowspear', 'Swiftfoot Boots', 'Indomitable Ancients', 'Plains', 'Plains', 'Plains'], []] });
    const mao = tg.names(0, 'hand').length;
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate('Shadowspear', 'Equipar');
    // o gatilho fica por cima da habilidade de equipar
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBeNull();
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf('Indomitable Ancients'));
    tg.activate('Swiftfoot Boots', 'Equipar').resolveAll();
    expect(tg.names(0, 'hand').length).toBe(mao + 1);
  });
});
