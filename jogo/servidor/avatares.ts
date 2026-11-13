// Catálogo dos retratos prontos dos jogadores (avatares na mesa). Um por deck, com os dois parceiros juntos quando há.
// Cada pessoa pode escolher qualquer retrato. Quem não escolheu usa o do
// comandante do próprio deck, se houver um, ou um medalhão com a inicial. As imagens ficam em
// cliente/src/imagens/avatares/<id>.webp; o servidor só usa a lista para validar a escolha.

export interface Avatar {
  id: string;
  nome: string;
  /** o deck de onde o retrato veio (só para mostrar na escolha) */
  deck: string;
  /** comandante cujo deck usa este retrato quando a pessoa não escolheu outro */
  comandante: string;
  /** outros nomes que usam o mesmo retrato (parceiros ou outra face da carta) */
  comandantes?: readonly string[];
  /** cor da aura atrás do retrato */
  aura: string;
}

export const AVATARES: Avatar[] = [
  { id: 'felothar', nome: 'Felothar', deck: 'Abzan Armor', comandante: 'Felothar the Steadfast', aura: '#e2b866' },
  { id: 'auntie-ool', nome: 'Auntie Ool', deck: 'Blight Curse', comandante: 'Auntie Ool, Cursewretch', aura: '#9a7fd1' },
  { id: 'quintorius', nome: 'Quintorius', deck: 'Lorehold Spirit', comandante: 'Quintorius, History Chaser', aura: '#ef7b3c' },
  { id: 'jace', nome: 'Jace', deck: 'Multiverse Reforged', comandante: 'Jace, Multiverse Architect', aura: '#3fa2f0' },
  { id: 'rootha', nome: 'Rootha', deck: 'Prismari Artistry', comandante: 'Rootha, Mastering the Moment', aura: '#ec4a96' },
  { id: 'killian', nome: 'Killian', deck: 'Silverquill Influence', comandante: 'Killian, Decisive Mentor', aura: '#e9dcae' },
  { id: 'terra', nome: 'Terra', deck: 'Terra', comandante: 'Terra, Herald of Hope', aura: '#f07fd0' },
  { id: 'dina', nome: 'Dina', deck: 'Witherbloom Pestilence', comandante: 'Dina, Essence Brewer', aura: '#93e04f' },
  { id: 'gisa', nome: 'Gisa', deck: 'Wretched Ranks', comandante: 'Ghoulcaller Gisa', aura: '#a99bc9' },
  { id: 'jin-sakai', nome: 'Jin Sakai', deck: "Jin's Vengeance", comandante: 'Jin Sakai, Ghost of Tsushima', aura: '#d44b40' },
  { id: 'sauron', nome: 'Sauron', deck: 'The Hosts of Mordor', comandante: 'Sauron, Lord of the Rings', aura: '#e76528' },
  { id: 'doctor-doom', nome: 'Doctor Doom', deck: 'Doom Prevails', comandante: 'Doctor Doom, King of Latveria', aura: '#62c779' },
  { id: 'black-panther', nome: "T'Challa", deck: 'Wakanda Forever', comandante: "T'Challa, the Black Panther", aura: '#ab7fea' },
  { id: 'invisible-woman', nome: 'Invisible Woman', deck: "The Fantastic Four Collector's Edition", comandante: 'Invisible Woman', aura: '#6ccdfa' },
  { id: 'leonardo', nome: 'Leonardo', deck: 'Turtle Power!', comandante: 'Leonardo, the Balance', aura: '#56a7f0' },
  { id: 'hatsune-miku', nome: 'Hatsune Miku', deck: 'Hatsune Miku', comandante: "Trostani, Selesnya's Voice", aura: '#51d9cf' },
  { id: 'lathliss', nome: 'Lathliss', deck: 'Reign of Dragons', comandante: 'Lathliss, Dragon Queen', aura: '#ef713b' },
  { id: 'rin-seri', nome: 'Rin e Seri', deck: 'Raining Cats and Dogs', comandante: 'Rin and Seri, Inseparable // Rin and Seri, Inseparable', comandantes: ['Rin and Seri, Inseparable'], aura: '#d6bb76' },
  { id: 'anhelo', nome: 'Anhelo', deck: 'Maestros Massacre', comandante: 'Anhelo, the Painter', aura: '#b570e2' },
  { id: 'szarekh', nome: 'Szarekh', deck: 'Necron Dynasties', comandante: 'Szarekh, the Silent King', aura: '#87d944' },
  { id: 'strefan', nome: 'Strefan', deck: 'Vampiric Bloodline', comandante: 'Strefan, Maurer Progenitor', aura: '#cb4f64' },
  { id: 'sai', nome: 'Sai', deck: 'Keen Engineering', comandante: 'Sai, Master Thopterist', aura: '#57c1de' },
  { id: 'yennett', nome: 'Yennett', deck: 'Odd and Ends', comandante: 'Yennett, Cryptic Sovereign', aura: '#c898ec' },
  { id: 'kaalia', nome: 'Kaalia', deck: 'Heavenly Inferno', comandante: 'Kaalia of the Vast', aura: '#e08b61' },
  { id: 'timey-wimey', nome: 'Décimo Doutor e Rose', deck: 'Timey-Wimey', comandante: 'The Tenth Doctor', comandantes: ['Rose Tyler'], aura: '#738de9' },
  { id: 'food-and-fellowship', nome: 'Frodo e Sam', deck: 'Food and Fellowship', comandante: 'Frodo, Adventurous Hobbit', comandantes: ['Sam, Loyal Attendant'], aura: '#b6bd70' },
  { id: 'nelly', nome: 'Nelly Borca', deck: 'Blame Game', comandante: 'Nelly Borca, Impulsive Accuser', aura: '#d9584a' },
  { id: 'hazel', nome: 'Hazel', deck: 'Squirreled Away', comandante: 'Hazel of the Rootbloom', aura: '#8fbf5a' },
  { id: 'kotori', nome: 'Kotori', deck: 'Buckle Up', comandante: 'Kotori, Pilot Prodigy', aura: '#5fb7e8' },
  { id: 'giada', nome: 'Giada', deck: 'Calling All Angels', comandante: 'Giada, Font of Hope', aura: '#f0dca0' },
  { id: 'ghalta', nome: 'Ghalta', deck: 'Tramplesaurus Rex', comandante: 'Ghalta, Primal Hunger', aura: '#6fcf4f' },
  { id: 'gonti', nome: 'Gonti', deck: 'Grand Larceny', comandante: 'Gonti, Canny Acquisitor', aura: '#8f7ad9' },
  { id: 'stella-lee', nome: 'Stella Lee', deck: 'Quick Draw', comandante: 'Stella Lee, Wild Card', aura: '#e6743a' },
  { id: 'aminatou', nome: 'Aminatou', deck: 'Miracle Worker', comandante: 'Aminatou, Veil Piercer', aura: '#8fa6e8' },
  { id: 'cloud', nome: 'Cloud', deck: 'Cloud', comandante: 'Cloud, Ex-SOLDIER', aura: '#7fb0d8' },
  { id: 'borg-queen', nome: 'Rainha Borg', deck: 'We Are The Borg', comandante: 'The Borg Queen', aura: '#6fd17a' },
  { id: 'spock', nome: 'Spock', deck: 'Landing Party', comandante: 'Commander Spock', aura: '#5aa0e8' },
  { id: 'orvar', nome: 'Orvar', deck: 'Twitch Control', comandante: 'Orvar, the All-Form', aura: '#4fc9e0' },
  { id: 'ur-dragon', nome: 'Ur-Dragão', deck: 'How to Train Ur-Dragon', comandante: 'The Ur-Dragon', aura: '#e05a3a' },
  { id: 'inalla', nome: 'Inalla', deck: "Wizard's Chess", comandante: 'Inalla, Archmage Ritualist', aura: '#a86bd8' },
  { id: 'lula',nome: 'Lula', deck: 'Brasil Pronto pra Mais', comandante: 'Lula, o Espanca Pobre', aura: '#d8392f' },
  { id: 'bolsonaro', nome: 'Bolsonaro', deck: 'O Brasil Vai Vencer', comandante: 'Bolsonaro, o Genocida', aura: '#e3c341' },
];

export const avatarValido = (x: unknown): x is string => typeof x === 'string' && AVATARES.some((a) => a.id === x);

/** o retrato de quem não escolheu: o do comandante do deck, se houver */
export const avatarDoComandante = (comandante: string | null | undefined): string | null =>
  (comandante ? AVATARES.find((a) => a.comandante === comandante || a.comandantes?.includes(comandante))?.id : null) ?? null;
