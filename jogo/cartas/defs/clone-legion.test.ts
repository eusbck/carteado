import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Clone Legion';
const ilhas = Array(9).fill('Island');

describe(N, () => {
  it('cria uma ficha cópia de cada criatura do jogador alvo, todas sob o seu controle', () => {
    const tg = setup({
      battlefield: [ilhas, [{ name: 'Indomitable Ancients', counters: { '+1/+1': 2 }, tapped: true }, 'Elvish Mystic', 'Sol Ring']],
      hand: [[N], []],
    });
    tg.choose('jogador alvo', ['Bruno']).cast(N).resolveAll();
    const minhas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].controller === 0 && tg.state.objects[id].isToken);
    expect(minhas.map((id) => tg.state.objects[id].copyOf?.def ?? tg.state.objects[id].def).sort()).toEqual(['Elvish Mystic', 'Indomitable Ancients']);
    // só o que está impresso: sem os marcadores e desvirada
    const anciao = minhas.find((id) => tg.pt(id)[1] === 10)!;
    expect(tg.pt(anciao)).toEqual([2, 10]);
    expect(tg.state.objects[anciao].tapped).toBe(false);
    // o artefato não é copiado, e os originais continuam com o oponente
    expect(tg.all('Sol Ring')).toHaveLength(1);
    expect(tg.names(1, 'battlefield')).toHaveLength(3);
  });

  it('as habilidades de entrar das criaturas copiadas disparam para as fichas', () => {
    // Rapacious Dragon: quando entra, crie duas fichas de Treasure
    const tg = setup({ battlefield: [ilhas, ['Rapacious Dragon']], hand: [[N], []] });
    tg.choose('jogador alvo', ['Bruno']).cast(N).resolveAll();
    expect(tg.all('Treasure').filter((id) => tg.state.objects[id].controller === 0)).toHaveLength(2);
  });

  it('copiando as suas próprias lendárias, a regra da lenda se aplica', () => {
    const tg = setup({ battlefield: [[...ilhas, 'Lathliss, Dragon Queen'], []], hand: [[N], []] });
    tg.choose('jogador alvo', ['Ana']).cast(N).resolveAll();
    // CR 704.5j: das duas Lathliss (a carta e a ficha cópia), fica só a que você escolher
    const lendarias = tg.state.zones.battlefield.filter((id) => (tg.state.objects[id].copyOf?.def ?? tg.state.objects[id].def) === 'Lathliss, Dragon Queen');
    expect(lendarias).toHaveLength(1);
  });
});
