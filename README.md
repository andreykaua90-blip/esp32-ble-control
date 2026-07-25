# ESP32-C3 · BLE Control

Painel web futurista para controlar um LED no ESP32-C3 via Bluetooth Low Energy (Web Bluetooth API), com o firmware em Arduino/C++ para o lado do dispositivo.

## Estrutura do projeto

```
esp32-ble-control/
├── index.html            # página principal
├── css/
│   └── style.css         # visual dark/futurista
├── js/
│   ├── ble.js             # lógica de conexão BLE (não alterada)
│   └── scene3d.js         # cena 3D decorativa (Three.js)
├── firmware/
│   └── esp32-c3-led.ino   # firmware Arduino/C++ do ESP32-C3
└── README.md
```

## Como rodar o site

O Web Bluetooth só funciona em contexto seguro (HTTPS ou `localhost`). Se for testar localmente, sirva por um servidor local (não abra com `file://`):

```bash
cd esp32-ble-control
python3 -m http.server 8000
```

Ou, se estiver publicado no GitHub Pages, é só acessar o link — já vem em HTTPS.

## Como gravar o firmware no ESP32-C3

1. Abra `firmware/esp32-c3-led.ino` na Arduino IDE (com o suporte a placas ESP32 instalado).
2. Selecione a placa "ESP32C3 Dev Module" (ou equivalente) e a porta correta.
3. Faça o upload para a placa.
4. Abra o Monitor Serial (115200 baud) para ver os logs de conexão e comandos.

O LED embutido acende/apaga com lógica invertida (Active LOW), como já tratado no código.

## UUIDs (site e firmware precisam bater)

| Papel | UUID |
|---|---|
| Serviço | `6e400001-b5a3-f393-e0a9-e50e24dcca9e` |
| Característica (RX) | `6e400002-b5a3-f393-e0a9-e50e24dcca9e` |

## Notas

- A lógica de conexão BLE em `js/ble.js` é exatamente a original — nenhuma linha foi alterada.
- A cena 3D em `js/scene3d.js` é puramente decorativa: ela só observa os cliques nos botões para animar o LED virtual, sem interferir na comunicação real com o ESP32.
