import { describe, expect, it } from 'vitest';
import { chars, gainControl, isCreature } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const ARV = 'Arvinox, the Mind Flail';

describe(ARV, () => {
  it('não é criatura a menos que você controle três ou mais permanentes de que não é dono', () => {
    const tg = setup({ battlefield: [[ARV], ['Sol Ring', 'Forest', 'Wall of Omens']] });
    const id = tg.bf(ARV);
    expect(isCreature(tg.g, id)).toBe(false);
    expect(chars(tg.g, id).types).toEqual(['Enchantment']);
    for (const nome of ['Sol Ring', 'Forest']) gainControl(tg.g, tg.bf(nome), 0, { kind: 'permanent' }, id);
    tg.g.bump();
    expect(isCreature(tg.g, id)).toBe(false);
    gainControl(tg.g, tg.bf('Wall of Omens'), 0, { kind: 'permanent' }, id);
    tg.g.bump();
    expect(isCreature(tg.g, id)).toBe(true);
    expect(chars(tg.g, id).subtypes).toEqual(['Horror']);
  });

  it('na sua etapa final, exila virada para baixo a carta do fundo do grimório de cada oponente; você conjura as de permanente com mana de qualquer tipo', () => {
    const tg = setup({
      players: 3, step: 'main2',
      battlefield: [[ARV, 'Swamp', 'Swamp', 'Swamp'], [], []],
      library: [['Island', 'Island', 'Island'], ['Forest', 'Ghostly Prison'], ['Forest', 'Utter End']],
    });
    tg.passTo('end');
    tg.resolve();
    const prisao = tg.find('Ghostly Prison', 'exile')!;
    const fim = tg.find('Utter End', 'exile')!;
    expect(tg.state.objects[prisao].faceDown).toBe(true);
    expect(tg.state.objects[prisao].visibleTo).toEqual([0]);
    expect(tg.state.objects[fim].faceDown).toBe(true);
    // no próximo turno de Ana: Ghostly Prison ({2}{W}) com três Swamps (mana de qualquer tipo); Utter End (instantânea) não
    tg.passTo('main1', 0);
    const acoes = tg.actionIds().filter((a) => a.startsWith('cast:'));
    expect(acoes.some((a) => a.split(':')[1] === String(prisao))).toBe(true);
    expect(acoes.some((a) => a.split(':')[1] === String(fim))).toBe(false);
    tg.answer({ kind: 'priority', action: acoes.find((a) => a.split(':')[1] === String(prisao))! });
    tg.settle();
    tg.resolve();
    expect(tg.find('Ghostly Prison', 'battlefield', 0)).not.toBeNull();
  });
});
