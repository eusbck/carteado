import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Grasp of Fate';

describe(N, () => {
  it('exila até um permanente de cada oponente; quando ele sai do campo, elas voltam', () => {
    const tg = setup({ players: 3, battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], ['Sol Ring', 'Baleful Strix', 'Forest'], ['Thieving Amalgam']], hand: [[N, 'Invoke the Divine'], [], []] });
    let max = 0;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente não terreno alvo')) return null;
      max = d.max;
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Baleful Strix')!.id, d.items.find((i) => i.label === 'Thieving Amalgam')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(max).toBe(2);
    expect(tg.find('Baleful Strix')).toBeNull();
    expect(tg.find('Thieving Amalgam')).toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
    tg.choose('artefato ou encantamento alvo', [N]);
    tg.cast('Invoke the Divine').resolve();
    expect(controllerOf(tg.g, tg.bf('Baleful Strix'))).toBe(1);
    expect(controllerOf(tg.g, tg.bf('Thieving Amalgam'))).toBe(2);
  });

  it('com um oponente só, no máximo um alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Sol Ring', 'Baleful Strix']], hand: [[N], []] });
    let max = 0;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente não terreno alvo')) return null;
      max = d.max;
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(max).toBe(1);
  });

  it('se Grasp of Fate sai do campo antes de o gatilho resolver, nada é exilado', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], ['Baleful Strix']], hand: [[N, 'Invoke the Divine'], []] });
    tg.choose('permanente não terreno alvo', ['Baleful Strix']);
    tg.cast(N);
    tg.resolve();
    // o gatilho está na pilha; em resposta, Invoke the Divine destrói Grasp of Fate
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.choose('artefato ou encantamento alvo', [N]);
    tg.cast('Invoke the Divine');
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.find('Baleful Strix')).not.toBeNull();
  });

  it('CR 610.3: destruído por Invoke the Divine, as permanentes voltam na hora, sem nada na pilha', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], [{ name: 'Indomitable Ancients', counters: { '+1/+1': 2 } }]], hand: [[N, 'Invoke the Divine'], []] });
    tg.choose('permanente não terreno alvo', ['Indomitable Ancients']);
    tg.cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    tg.choose('artefato ou encantamento alvo', [N]);
    tg.cast('Invoke the Divine').resolve();
    // não há gatilho de "voltar" esperando: a carta já está no campo assim que Invoke the Divine termina
    expect(tg.state.zones.stack).toHaveLength(0);
    const ancients = tg.bf('Indomitable Ancients');
    expect(controllerOf(tg.g, ancients)).toBe(1);
    // ruling 2: volta como objeto novo, sem os marcadores
    expect(tg.state.objects[ancients].counters['+1/+1'] ?? 0).toBe(0);
  });

  it('CR 800.4a, 610.3: o dono de Grasp of Fate deixa a partida: as permanentes exiladas voltam', () => {
    const tg = setup({ players: 3, battlefield: [['Plains', 'Plains', 'Plains'], ['Baleful Strix'], ['Thieving Amalgam']], hand: [[N], [], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('permanente não terreno alvo')
      ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Baleful Strix')!.id, d.items.find((i) => i.label === 'Thieving Amalgam')!.id] } : null));
    tg.cast(N).resolveAll();
    expect(tg.find('Baleful Strix')).toBeNull();
    tg.game.concede(0);
    tg.settle();
    expect(tg.state.players[0].left).toBe(true);
    expect(controllerOf(tg.g, tg.bf('Baleful Strix'))).toBe(1);
    expect(controllerOf(tg.g, tg.bf('Thieving Amalgam'))).toBe(2);
  });
});
