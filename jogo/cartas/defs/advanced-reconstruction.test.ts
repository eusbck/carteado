import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { exile } from '../../motor/api.ts';

describe('Advanced Reconstruction', () => {
  it('nível 1: mói, exila uma carta aleatória do cemitério e a carta exilada pode ser jogada neste turno', () => {
    const tg = setup({ step: 'upkeep', battlefield: [['Advanced Reconstruction'], []], library: [['Island', 'Plains'], ['Island']] });
    tg.passTo('main1').resolveAll();
    // comprou a Island, moeu a Plains e a exilou (única carta no cemitério)
    expect(tg.names(0, 'exile')).toEqual(['Plains']);
    expect(tg.actionIds().some((a) => a.startsWith('play:') && a.includes('perm:'))).toBe(true);
  });
  it('níveis 2 e 3: várias cartas saindo juntas causam dano uma vez; mágicas de fora da mão custam {2} a menos', () => {
    const tg = setup({
      battlefield: [['Advanced Reconstruction', ...Array(6).fill('Mountain')], []], graveyard: [['Island', 'Island', 'Laughing Mad'], []],
      hand: [['Plains'], []], library: [['Swamp', 'Swamp', 'Swamp'], []],
    });
    tg.activate('Advanced Reconstruction', 'Nível 2').resolve();
    tg.run(exile(tg.g, tg.state.zones.graveyard[0].filter((id) => tg.state.objects[id].def === 'Island')));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
    tg.activate('Advanced Reconstruction', 'Nível 3').resolve();
    // sobram duas Mountains: Laughing Mad com flashback ({3}{R}) sai por {1}{R}, descartando a Plains
    expect(tg.canCast('Laughing Mad')).toBe(true);
  });
});
