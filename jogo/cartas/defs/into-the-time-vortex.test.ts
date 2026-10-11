import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Into the Time Vortex';
const montanhas = Array(5).fill('Mountain');
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('CR 702.85a: a cascata resolve antes da mágica e conjura de graça a primeira carta não terreno que custa menos', () => {
    // Zetalpa (valor de mana 8) não custa menos que 5 e é pulada junto com o terreno; o Sol Ring é o achado
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [['Island', 'Zetalpa, Primal Dawn', 'Sol Ring', ...forests], forests] });
    tg.yes('Cascata', true).cast(N);
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    // o Sol Ring foi conjurado e está acima da mágica com cascata
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // as outras exiladas foram para o fundo do grimório
    expect(tg.state.zones.exile).toHaveLength(0);
    const lib = tg.names(0, 'library');
    expect(lib.slice(0, 10)).toEqual(forests);
    expect(lib.slice(10).sort()).toEqual(['Island', 'Zetalpa, Primal Dawn']);
    tg.resolveAll();
    // CR 702.88a: conjurada da mão, vai para o exílio ao resolver
    expect(tg.find(N, 'exile')).not.toBeNull();
  });

  it('recusando conjurar, a carta achada vai para o fundo com as outras', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [['Island', 'Sol Ring', ...forests], forests] });
    tg.yes('Cascata', false).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.names(0, 'library').slice(10).sort()).toEqual(['Island', 'Sol Ring']);
  });

  it('anulada depois de conjurada, a cascata resolve do mesmo jeito', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [['Sol Ring', ...forests], forests] });
    tg.yes('Cascata', true).cast(N);
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    tg.resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // anulada, vai para o cemitério e não ricocheteia
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('pelo ricochete, é conjurada de novo na próxima manutenção e a cascata dispara outra vez', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [['Sol Ring', ...forests, 'Sol Ring', ...forests], forests] });
    tg.yes('Cascata', true).cast(N).resolveAll();
    expect(tg.all('Sol Ring')).toHaveLength(1);
    tg.yes('Ricochete', true).yes('Cascata', true);
    tg.passTo('upkeep', 0);
    tg.resolveAll();
    expect(tg.all('Sol Ring')).toHaveLength(2);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
