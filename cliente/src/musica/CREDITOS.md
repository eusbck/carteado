# Música da mesa

| | |
| --- | --- |
| Arquivo | `the-snow-queen.mp3` |
| Título | The Snow Queen |
| Autor | Kevin MacLeod (incompetech.com) |
| Página da obra | https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100872 |
| Arquivo original | https://incompetech.com/music/royalty-free/mp3-royaltyfree/The%20Snow%20Queen.mp3 (MP3 320 kbps, 8.806.317 bytes, sha256 `398cce89…3f3ed6a`) |
| Licença | Creative Commons Atribuição 4.0 (CC BY 4.0), https://creativecommons.org/licenses/by/4.0/ |
| Baixado em | 07/10/2026 |

Crédito pedido pela página (bloco "Attribution Code"):

```
"The Snow Queen" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
```

O crédito também aparece na janela Configurações da mesa, junto do controle da música.

## O que foi alterado

Só o formato: o MP3 original (320 kbps, 8,8 MB) foi recodificado para MP3 VBR (~150 kbps, 4,2 MB) com
`ffmpeg -i "The Snow Queen.mp3" -map_metadata -1 -c:a libmp3lame -q:a 4 -ar 44100` (mais as etiquetas de
título, autor e licença). Nada foi cortado nem mixado.

## Por que esta faixa

Orquestral de fantasia (cordas, fagote, clarone, flauta, celesta e tímpanos), "mysterious, mystical", com
uma construção grande a partir de 1:50; 3:40, sol menor, 96 bpm. É uma obra original de biblioteca, sem
ligação com trilha de jogo. A página diz que ela volta ao começo ("it does loop back to the beginning").

## Como emenda (cliente/src/musica.ts)

A faixa termina com um acorde forte no primeiro tempo do compasso 87 (por volta de 214,9 s) que se apaga
até 220 s, e começa com um ataque logo no início. A volta seguinte entra um compasso depois desse acorde
(217,4 s a partir do começo do som), no tempo, por cima da cauda, que sai em 2,6 s. Se o arquivo mudar,
esses pontos precisam ser medidos de novo.
