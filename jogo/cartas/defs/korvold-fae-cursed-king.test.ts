import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { sacrifice } from '../../motor/api.ts';

const K = 'Korvold, Fae-Cursed King';

describe(K, () => {
  it('ao entrar, sacrifica outro permanente; cada sacrifício põe um marcador e compra', () => {
    const tg = setup({ battlefield: [['Swamp', 'Mountain', 'Forest', 'Forest', 'Sol Ring'], []], hand: [[K], []], library: [['Island', 'Plains'], []] });
    tg.choose('Sacrifique', ['Sol Ring']).cast(K).resolve();
    tg.resolve(); // gatilho de entrar: sacrifica
    tg.resolve(); // gatilho de sacrifício
    expect(tg.find('Sol Ring', 'graveyard', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf(K)].counters['+1/+1']).toBe(1);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('sem outro permanente, não sacrifica nada', () => {
    const tg = setup({ battlefield: [[K], []] });
    tg.attack([[K, 1]]).passUntil((x) => x.state.turn.step === 'declareAttackers' && x.state.zones.stack.length > 0);
    tg.resolve();
    expect(tg.find(K, 'battlefield', 0)).not.toBeNull();
    expect(tg.state.zones.stack.length).toBe(0);
  });

  it('sacrificando Korvold, compra uma carta sem pôr marcador', () => {
    const tg = setup({ battlefield: [[K], []], library: [['Island'], []] });
    tg.run(sacrifice(tg.g, [tg.bf(K)]));
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('sacrificar como custo dispara; o gatilho resolve antes da habilidade', () => {
    // Bloodstained Mire: sacrificado no custo; o gatilho de Korvold fica por cima
    const tg = setup({ battlefield: [[K, 'Bloodstained Mire'], []], library: [['Island', 'Swamp'], []] });
    tg.choose('Swamp ou Mountain', ['Swamp']).activate('Bloodstained Mire');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.state.objects[tg.bf(K)].counters['+1/+1']).toBe(1);
    tg.resolve();
    expect(tg.find('Swamp', 'battlefield', 0)).not.toBeNull();
  });
});
