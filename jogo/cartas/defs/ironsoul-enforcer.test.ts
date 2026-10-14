import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Ironsoul Enforcer';

describe(N, () => {
  it('atacando sozinha, devolve um artefato do cemitério para o campo; com outra atacante, não', () => {
    const tg = fixture({ battlefield: [[N, 'Ripjaw Raptor'], []], graveyard: [['Sol Ring'], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.find('Sol Ring')).not.toBeNull();

    const junto = fixture({ battlefield: [[N, 'Ripjaw Raptor'], []], graveyard: [['Sol Ring'], []] });
    junto.attack([[N, 1], ['Ripjaw Raptor', 1]]).passTo('declareBlockers');
    expect(junto.find('Sol Ring')).toBeNull();
  });

  it('o seu comandante atacando sozinho também dispara', () => {
    const tg = fixture({ battlefield: [[N, { name: 'Ripjaw Raptor', commander: true }], []], graveyard: [['Sol Ring'], []] });
    tg.attack([['Ripjaw Raptor', 1]]).passTo('declareBlockers');
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
