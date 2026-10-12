// Arcade Cabinet
// When this artifact enters, put a +1/+1 counter on each of up to four target creatures.
// {2}, {T}, Sacrifice a token: Double the number of each kind of counter on target creature.
import { activated, addCounters, defineCard, etb, t, tgt, upTo } from '../../motor/api.ts';
import { dobraMarcadores } from '../tartarugas.ts';

const DOBRA = activated('{2}, {T}', function* (c) {
  const id = tgt(c);
  if (id === null) return;
  // ruling 1: dobrar é pôr tantos marcadores de cada tipo quantos já tem (CR 701.10e)
  for (const tipo of Object.keys(c.g.state.objects[id].counters)) dobraMarcadores(c.g, id, tipo, c.you);
}, { targets: [t.creature()], text: '{2}, {T}, Sacrifique uma ficha: Dobre o número de cada tipo de marcador na criatura alvo.' });
// o custo "sacrifique uma ficha" não tem texto que o analisador de custos entenda
DOBRA.cost.push({ k: 'sacrifice', n: 1, label: 'uma ficha', filter: (c, id) => !!c.g.state.objects[id]?.isToken });

export default defineCard({
  name: 'Arcade Cabinet',
  faces: [{
    abilities: [
      etb(function* (c) {
        for (const r of c.targets[0] ?? []) if (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: r.id }, '+1/+1', 1, c.you);
      }, { targets: [upTo(4, t.creature())], text: 'Quando este artefato entra, coloque um marcador +1/+1 em cada uma de até quatro criaturas alvo.' }),
      DOBRA,
    ],
  }],
  rulings: { 1: 'teste: um marcador em até quatro criaturas ao entrar; {2}, {T} e uma ficha: dobra cada tipo de marcador da criatura alvo' },
});