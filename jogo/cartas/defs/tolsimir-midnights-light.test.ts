import { describe, expect, it } from 'vitest';
import { validateBlocks } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const N = "Tolsimir, Midnight's Light";

describe(N, () => {
  it('cria Voja Fenstalker; quando Voja ataca junto com Tolsimir, a criatura alvo precisa bloqueá-la', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Plains', 'Plains', 'Plains'], ['Elvish Mystic', 'Indomitable Ancients']], hand: [[N], []] });
    tg.cast(N).resolve();
    tg.resolveAll();
    const voja = tg.bf('Voja Fenstalker');
    expect(tg.pt(voja)).toEqual([5, 5]);
    // sem enjoo de invocação para o teste
    tg.state.objects[voja].controlledSince = -1;
    tg.state.objects[tg.bf(N)].controlledSince = -1;
    let erroSemBloqueio: string | null = null;
    let erroComBloqueio: string | null = 'x';
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      const mystic = tg.bf('Elvish Mystic');
      erroSemBloqueio = validateBlocks(tg.g, 1, []);
      erroComBloqueio = validateBlocks(tg.g, 1, [[mystic, voja]]);
      return { kind: 'blockers', blocks: [[mystic, voja]] };
    });
    tg.choose('criatura alvo que um oponente controla', ['Elvish Mystic']).attack([[N, 1], ['Voja Fenstalker', 1]]).passTo('combatDamage');
    expect(erroSemBloqueio).toContain('Elvish Mystic precisa bloquear');
    expect(erroComBloqueio).toBeNull();
  });
});
