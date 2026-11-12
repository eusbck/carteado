// lote4-e: regra do mundo (CR 704.5k; motor/mundo.ts), com Concordant Crossroads (encantamento mundial)
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { putOntoBattlefield } from '../motor/api.ts';

const N = 'Concordant Crossroads';
const noCampo = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === N);

describe('Regra do mundo (CR 704.5k)', () => {
  it('CR 704.5k: conjurar um segundo manda o anterior para o cemitério do dono', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [[N], []] });
    const antigo = tg.bf(N);
    tg.cast(N).resolve();
    expect(noCampo(tg).length).toBe(1);
    expect(noCampo(tg)).not.toContain(antigo);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('CR 704.5k: vale entre jogadores diferentes; o mais novo fica, o outro vai para o cemitério do dono', () => {
    const tg = setup({ battlefield: [[N], []], hand: [[], [N]] });
    const deBruno = tg.find(N, 'hand', 1)!;
    tg.run(putOntoBattlefield(tg.g, [{ id: deBruno, controller: 1 }], 'effect'));
    tg.pass();
    expect(noCampo(tg).map((id) => tg.state.objects[id].controller)).toEqual([1]);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('CR 704.5k: um só permanente mundial não é afetado', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.pass();
    expect(noCampo(tg).length).toBe(1);
  });
});
