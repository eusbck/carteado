import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'The Mimeoplasm';
const terrenos = ['Island', 'Swamp', 'Forest', 'Island', 'Swamp'];

describe(N, () => {
  it('as duas cartas podem vir de cemitérios diferentes; você escolhe qual copiar e qual dá os marcadores; as habilidades de entrar do modelo funcionam', () => {
    // copia Baleful Strix (de Ana) e ganha marcadores pela força de Thieving Amalgam (6, de Bruno)
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], graveyard: [['Baleful Strix'], ['Thieving Amalgam']], library: [['Forest', 'Island'], []] });
    tg.yes('The Mimeoplasm: exilar', true).choose('carta que ela vai copiar', ['Baleful Strix (cemitério de Ana)']).choose('a outra carta', ['Thieving Amalgam (cemitério de Bruno)']);
    tg.cast(N).resolveAll();
    const id = tg.bf('Baleful Strix');
    expect(tg.state.objects[id].counters['+1/+1']).toBe(6);
    expect(tg.pt(id)).toEqual([7, 7]);
    // o "ao entrar, compre uma carta" do Strix
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.state.zones.exile.map((x) => tg.state.objects[x].def).sort()).toEqual(['Baleful Strix', 'Thieving Amalgam']);
  });

  it('com só uma carta de criatura nos cemitérios, nada é exilado e ela morre como 0/0', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], graveyard: [['Baleful Strix', 'Rampant Growth'], []] });
    tg.cast(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Baleful Strix', 'Rampant Growth', N]);
  });

  it('você pode não exilar', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], graveyard: [['Baleful Strix', 'Slither Blade'], []] });
    tg.yes('The Mimeoplasm: exilar', false);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Baleful Strix', 'Slither Blade', N]);
  });
});
