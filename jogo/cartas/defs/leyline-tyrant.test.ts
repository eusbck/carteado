import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Leyline Tyrant';
const reserva = (tg: ReturnType<typeof setup>, p = 0) => tg.state.players[p].manaPool.map((u) => u.type).join('');

describe(N, () => {
  it('a mana vermelha não gasta fica entre etapas, fases e turnos; as outras cores se perdem', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Forest'], ['Mountain']] });
    activateMana(tg, 'Mountain', 'R');
    activateMana(tg, 'Forest', 'G');
    expect(reserva(tg).split('').sort().join('')).toBe('GR');
    tg.passTo('beginCombat');
    expect(reserva(tg)).toBe('R');
    tg.passTo('main1', 1);
    expect(reserva(tg)).toBe('R');
    // a mana vermelha do oponente se perde normalmente
    tg.passTo('upkeep', 0);
    expect(reserva(tg, 1)).toBe('');
    expect(reserva(tg)).toBe('R');
  });

  it('depois que ele sai do campo, a mana vermelha se perde no fim da etapa', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], []] });
    activateMana(tg, 'Mountain', 'R');
    tg.number('Leyline Tyrant', 0);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(reserva(tg)).toBe('R');
    tg.passTo('beginCombat');
    expect(reserva(tg)).toBe('');
  });

  it('ao morrer, paga {R}{R}{R} (inclusive com a mana guardada) e causa 3 de dano ao alvo escolhido depois de pagar', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain', 'Mountain', 'Forest'], ['Indomitable Ancients']] });
    activateMana(tg, 'Mountain', 'R');
    let maximo = -1;
    tg.script.push((d) => {
      if (d.kind !== 'number' || !d.prompt.startsWith(N)) return null;
      maximo = d.max;
      return { kind: 'number', value: 3 };
    });
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolve();
    // a Forest não gera {R}: no máximo três (uma na reserva e duas Mountains)
    expect(maximo).toBe(3);
    // o dano ainda não aconteceu: é um segundo gatilho, que vai para a pilha depois do pagamento
    expect(tg.life(1)).toBe(40);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.all('Mountain').every((id) => tg.state.objects[id].tapped)).toBe(true);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
  });

  it('pagar é opcional: com zero, nada acontece', () => {
    const tg = setup({ battlefield: [[N, 'Mountain'], []] });
    tg.number('Leyline Tyrant', 0);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(40);
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(false);
  });
});
