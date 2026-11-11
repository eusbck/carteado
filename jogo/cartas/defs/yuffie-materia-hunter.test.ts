import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Yuffie, Materia Hunter';

describe(C, () => {
  it('ganha o controle de um artefato que não é criatura e pode anexar um Equipamento a Yuffie', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], ['Darksteel Plate']], hand: [[C], []] });
    tg.choose('artefato não criatura', ['Darksteel Plate']).choose('Anexe um Equipamento', ['Darksteel Plate']);
    tg.cast(C).resolveAll();
    const placa = tg.bf('Darksteel Plate');
    expect(controllerOf(tg.g, placa)).toBe(0);
    expect(tg.state.objects[placa].attachedTo).toBe(tg.bf(C));
  });
});
