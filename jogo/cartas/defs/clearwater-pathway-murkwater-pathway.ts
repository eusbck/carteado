// Clearwater Pathway // Murkwater Pathway (modal de duas faces)
// Clearwater Pathway — Land
// {T}: Add {U}.
// Murkwater Pathway — Land
// {T}: Add {B}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Clearwater Pathway // Murkwater Pathway',
  faces: [
    { abilities: [mana('U')] },
    { abilities: [mana('B')] },
  ],
  rulings: {
    1: 'não se aplica: marcas de face impressas não têm efeito no jogo (CR 712.3a-b)',
    2: 'teste: CR 712.11c — jogar olha só a face escolhida: frente dá {U}, verso dá {B}',
    3: 'regra geral: CR 712.12 — permissão de jogar oferece as duas faces; de conjurar, nenhuma (testes/regras-formatos.test.ts)',
    4: 'regra geral: CR 712.12 — a face que se encaixa no efeito (testes/regras-formatos.test.ts)',
    5: 'regra geral: CR 712.8a — fora da pilha e do campo vale a frente (motor/formatos.ts)',
    6: 'regra geral: CR 712.14 — modal de duas faces não se transforma (testes/regras-formatos.test.ts)',
    7: 'regra geral: CR 712.14 — posta no campo por efeito, entra com a frente (motor/formatos.ts)',
    8: 'não se aplica: nenhuma carta dos decks manda escolher um nome',
    9: 'regra geral: CR 903.4d — a identidade de cor soma as duas faces (gerado/cartas.json, motor/deck.ts)',
  },
});
