import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Master Transmuter";
describe(N, () => {
  it("devolve a si mesma como custo e pode pôr a mesma carta de volta como novo objeto", () => {

    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }, 'Island'], []] }); const old = tg.bf(N);
    tg.choose('Devolva', [N]).choose('Master Transmuter:', [N]).activate(N).resolveAll();
    expect(tg.bf(N)).not.toBe(old); expect(tg.state.objects[tg.bf(N)].counters).toEqual({}); expect(tg.state.objects[tg.bf(N)].controlledSince).toBe(tg.state.turn.number);
  });

  it("devolve ao dono uma permanente controlada e aceita artefato terreno da mão", () => {

    const tg = setup({ battlefield: [[N, 'Island'], ['Sol Ring']], hand: [['Darksteel Citadel'], []] }); const ring = tg.bf('Sol Ring'); tg.state.objects[ring].controller = 0; tg.g.bump(); tg.refresh();
    tg.choose('Devolva', ['Sol Ring']).choose('Master Transmuter:', ['Darksteel Citadel']).activate(N).resolveAll();
    expect(tg.names(1, 'hand')).toContain('Sol Ring'); expect(tg.find('Darksteel Citadel')).not.toBeNull();
  });
});
