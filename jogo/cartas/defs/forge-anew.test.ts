import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Forge Anew';

describe(C, () => {
  it('ao entrar, devolve um Equipamento do cemitério para o campo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [[C], []], graveyard: [['Basilisk Collar'], []] });
    tg.choose('Equipamento', ['Basilisk Collar']);
    tg.cast(C).resolveAll();
    expect(tg.find('Basilisk Collar')).not.toBeNull();
  });
  it('CR 602.5d: no seu turno equipa com a pilha ocupada (como instantânea), e o primeiro sai de graça', () => {
    const tg = setup({ battlefield: [[C, 'Basilisk Collar', 'Elvish Mystic', 'Island'], []], hand: [['Opt'], []], library: [['Opt'], []] });
    tg.cast('Opt');
    expect(tg.state.zones.stack.length).toBe(1);
    tg.choose('criatura alvo', ['Elvish Mystic']).activate('Basilisk Collar', 'Equipar').resolve();
    expect(tg.state.objects[tg.bf('Basilisk Collar')].attachedTo).toBe(tg.bf('Elvish Mystic'));
  });
});
