# ESP32-C3 · BLE Control

Painel web futurista para controlar um LED no ESP32-C3 via Bluetooth Low Energy (Web Bluetooth API), com firmware Python (MicroPython) para o lado do dispositivo.

## Estrutura do projeto

```
esp32-ble-control/
├── index.html          # página principal
├── css/
│   └── style.css       # visual dark/futurista
├── js/
│   ├── ble.js           # lógica de conexão BLE (não alterada)
│   └── scene3d.js       # cena 3D decorativa (Three.js)
├── firmware/
│   └── main.py          # firmware MicroPython do ESP32-C3
└── README.md
```

## Como rodar o site

O Web Bluetooth só funciona em contexto seguro (HTTPS ou `localhost`). Não abra `index.html` direto com `file://` — sirva por um servidor local:

```bash
cd esp32-ble-control
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000` em um navegador compatível (Chrome/Edge no desktop ou Android).

## Como gravar o firmware no ESP32-C3

1. Instale o MicroPython no ESP32-C3 (via [esptool](https://github.com/espressif/esptool) ou Thonny).
2. Conecte-se à placa via Thonny, `mpremote` ou `ampy`.
3. Instale a biblioteca `aioble` (necessária para BLE assíncrono):
   ```bash
   mpremote mip install aioble
   ```
4. Envie `firmware/main.py` para a placa como `main.py`:
   ```bash
   mpremote cp firmware/main.py :main.py
   ```
5. Reinicie a placa. Ela deve anunciar como `ESP32-C3-LED`.

> Ajuste `LED_PIN` em `firmware/main.py` conforme o GPIO do LED da sua placa.

## UUIDs (site e firmware precisam bater)

| Papel | UUID |
|---|---|
| Serviço | `6e400001-b5a3-f393-e0a9-e50e24dcca9e` |
| Característica (RX) | `6e400002-b5a3-f393-e0a9-e50e24dcca9e` |

## Notas

- A lógica de conexão BLE em `js/ble.js` é exatamente a original — nenhuma linha foi alterada.
- A cena 3D em `js/scene3d.js` é puramente decorativa: ela só observa os cliques nos botões para animar o LED virtual, sem interferir na comunicação real com o ESP32.
