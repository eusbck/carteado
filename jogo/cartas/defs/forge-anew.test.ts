import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Forge Anew';

const acoes = (tg: ReturnType<typeof setup>) => (tg.pending?.kind === 'priority' ? tg.pending.actions.map((a) => a.label) : []);

describe(N, () => {
  it('ao entrar, devolve a carta de Equipamento alvo do seu cemitério ao campo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [[N], []], graveyard: [['Loxodon Warhammer', 'Silver Myr'], []] });
    tg.choose('carta de Equipamento alvo', ['Loxodon Warhammer']).cast(N).resolveAll();
    expect(tg.find('Loxodon Warhammer', 'battlefield', 0)).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Silver Myr']);
  });

  it('no seu turno, equipar no tempo de instantânea e o primeiro equipar por {0}; no turno do oponente, não', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Loxodon Warhammer', 'Shadowspear'], []], step: 'beginCombat' });
    expect(acoes(tg).some((a) => a.startsWith('Loxodon Warhammer: Equipar'))).toBe(true);
    tg.yes('pagar {0}', true).choose('criatura alvo', ['Silver Myr']).activate('Loxodon Warhammer', 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf('Loxodon Warhammer')].attachedTo).toBe(tg.bf('Silver Myr'));
    // o segundo equipar do turno paga o custo ({2} da Shadowspear): sem terrenos, não dá
    expect(acoes(tg).some((a) => a.startsWith('Shadowspear: Equipar'))).toBe(false);
    tg.passTo('upkeep', 1);
    expect(acoes(tg).some((a) => a.includes('Equipar'))).toBe(false);
  });

  it('vale para variantes de equipar ("Equipar criatura lendária"), mas não para reconfigurar', () => {
    const tg = setup({ battlefield: [[N, 'Wyleth, Soul of Steel', 'Blackblade Reforged', 'Lion Sash'], []] });
    expect(acoes(tg).some((a) => a.startsWith('Blackblade Reforged: Equipar criatura lendária'))).toBe(true);
    expect(acoes(tg).some((a) => a.startsWith('Lion Sash: Reconfigurar'))).toBe(false);
  });
});
