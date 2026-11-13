import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Inalla, Archmage Ritualist';

describe(NOME, () => {
  it('paga {1} e cria uma cópia com ímpeto, exilada no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', 'Island', 'Island', 'Swamp', 'Swamp'], []], hand: [['Spellseeker'], []], library: [['Island', 'Island'], ['Island']] });
    tg.yes('Pagar {1}', true);
    tg.cast('Spellseeker').resolveAll();
    const copias = tg.all('Spellseeker');
    expect(copias).toHaveLength(2);
    const ficha = copias.find((id) => tg.state.objects[id].isToken)!;
    expect(tg.g.state.objects[ficha]).toBeDefined();
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.all('Spellseeker')).toHaveLength(1);
  });

  it('da zona de comando também dispara; fichas não disparam', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [['Spellseeker'], []], command: [[NOME], []] });
    tg.yes('Pagar {1}', true);
    tg.cast('Spellseeker').resolveAll();
    // a ficha que entra não dispara de novo
    expect(tg.all('Spellseeker')).toHaveLength(2);
  });

  it('o Mago que já saiu do campo ainda é copiado pela última informação', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', 'Island', 'Island', 'Island', 'Island'], []], hand: [['Spellseeker', 'Chain of Vapor'], []] });
    tg.cast('Spellseeker');
    tg.resolve();
    // o gatilho está na pilha; em resposta, o Spellseeker volta para a mão
    tg.choose('permanente não terreno alvo', ['Spellseeker']).cast('Chain of Vapor').resolve();
    tg.yes('Pagar {1}', true);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toContain('Spellseeker');
    expect(tg.all('Spellseeker').filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
  });

  it('se Inalla muda de zona antes de a habilidade resolver, nada acontece', () => {
    const tg = setup({ battlefield: [[NOME, 'Island', 'Island', 'Island', 'Island'], []], hand: [['Spellseeker', 'Chain of Vapor'], []] });
    tg.cast('Spellseeker');
    tg.resolve();
    tg.choose('permanente não terreno alvo', [NOME]).cast('Chain of Vapor').resolve();
    tg.resolveAll();
    expect(tg.all('Spellseeker').filter((id) => tg.state.objects[id].isToken)).toHaveLength(0);
  });

  it('vira cinco Magos, inclusive com enjoo de invocação, e o alvo perde 7 de vida', () => {
    const magos = [NOME, { name: 'Spellseeker', ready: false }, 'Spellseeker', 'Thassa\'s Oracle', 'Fatestitcher'];
    const tg = setup({ battlefield: [magos, []] });
    tg.choose('jogador alvo', ['Bruno']).choose('Vire 5', [NOME, 'Spellseeker', 'Spellseeker', "Thassa's Oracle", 'Fatestitcher']).activate(NOME).resolve();
    expect(tg.life(1)).toBe(33);
  });
});
