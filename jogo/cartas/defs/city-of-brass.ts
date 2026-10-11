// City of Brass
// Whenever this land becomes tapped, it deals 1 damage to you.
// {T}: Add one mana of any color.
import { dealDamage, defineCard, mana, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'City of Brass',
  faces: [{ abilities: [
    // ruling 1 (CR 603.2e): dispara sempre que vira, por qualquer motivo; entrar virado não é "virar"
    // rulings 2 e 3: não é habilidade de mana (CR 605.1a), vai para a pilha na próxima vez que alguém receberia prioridade
    triggered(on.custom((e, c) => e.type === 'tap' && e.obj === c.source), function* (c) {
      dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]);
    }, { text: 'Sempre que este terreno fica virado, ele causa 1 de dano a você.' }),
    mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
  ] }],
  rulings: {
    1: 'teste: CR 603.2e: dispara também quando é virado por um efeito',
    2: 'teste: pode responder ao gatilho usando a mana: a mágica resolve antes do dano',
    3: 'teste: virado para pagar uma mágica, o gatilho vai para a pilha acima dela e resolve primeiro',
  },
});
