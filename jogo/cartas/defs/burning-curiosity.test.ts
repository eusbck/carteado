import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Burning Curiosity', () => {
  it('pagando blight, exila três; terreno exilado só pode ser jogado na fase principal, e a permissão dura até o fim do seu próximo turno', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Elvish Mystic'], []], hand: [['Burning Curiosity'], []], library: [['Forest', 'Plains', 'Island', 'Swamp', 'Swamp', 'Swamp'], ['Island', 'Island', 'Island']] });
    tg.choose('custo adicional opcional', ['Pagar: blight 1']).cast('Burning Curiosity').resolve();
    expect(tg.names(0, 'exile').sort()).toEqual(['Forest', 'Island', 'Plains']);
    const doExilio = () => (tg.pending!.kind === 'priority' ? tg.pending!.actions.filter((a) => a.id.startsWith('play:') && a.obj !== undefined && tg.state.objects[a.obj]?.zone === 'exile') : []);
    // no turno do oponente, não dá para jogar terreno; no seu próximo turno, dá
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'main1' && x.pending!.player === 0);
    expect(doExilio().length).toBe(0);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1');
    expect(doExilio().length).toBe(3);
    tg.play('Forest');
    expect(tg.find('Forest')).not.toBeNull();
    tg.passUntil((x) => x.state.turn.active === 1);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'main1');
    expect(doExilio().length).toBe(0);
  });
  it('sem blight, exila duas', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], []], hand: [['Burning Curiosity'], []], library: [['Forest', 'Plains', 'Island'], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).cast('Burning Curiosity').resolve();
    expect(tg.names(0, 'exile').length).toBe(2);
  });
});
