import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Eiganjo Dynastorian // Replenish';

describe(NOME, () => {
  it('ao ficar preparado, cria a cópia do feitiço no exílio; conjurá-la tira a designação; Aura devolvida escolhe o que encantar sem mirar', () => {
    const tg = setup({
      battlefield: [[NOME, 'Elvish Mystic', 'Plains', 'Plains', 'Plains', 'Plains'], ['Sylvan Caryatid']],
      graveyard: [['Bastion of Remembrance', 'Angelic Gift'], []], library: [['Island', 'Island'], ['Island']],
    });
    tg.attack([[NOME, 1], ['Elvish Mystic', 1]]).passTo('main2');
    expect(tg.state.objects[tg.bf(NOME)].prepared).toBe(true);
    tg.choose('vai encantar', ['Sylvan Caryatid']); // resistência a magia não impede: não mira
    tg.cast('Replenish', 'prepared').resolve().resolveAll();
    expect(tg.find('Bastion of Remembrance')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Angelic Gift')].attachedTo).toBe(tg.bf('Sylvan Caryatid'));
  });
});
