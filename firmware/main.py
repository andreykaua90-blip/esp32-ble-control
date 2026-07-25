# ============================================
# Firmware MicroPython — ESP32-C3
# Servidor BLE que controla um LED via GATT
# Usa a biblioteca 'aioble' (instalar com mip)
#
# Combina com o site: mesmos UUIDs de serviço
# e característica usados em js/ble.js
# ============================================

import aioble
import bluetooth
import uasyncio as asyncio
from machine import Pin

# --- Configuração de hardware ---
LED_PIN = 8  # GPIO do LED onboard na maioria das placas ESP32-C3 (ajuste se necessário)
led = Pin(LED_PIN, Pin.OUT)
led.value(0)

# --- Nome do dispositivo (deve bater com o filtro no site) ---
NOME_DISPOSITIVO = "ESP32-C3-LED"

# --- Mesmos UUIDs usados no frontend (js/ble.js) ---
SERVICE_UUID = bluetooth.UUID("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
CHARACTERISTIC_UUID_RX = bluetooth.UUID("6e400002-b5a3-f393-e0a9-e50e24dcca9e")

# --- Definição do serviço GATT ---
servico_led = aioble.Service(SERVICE_UUID)
caracteristica_rx = aioble.Characteristic(
    servico_led,
    CHARACTERISTIC_UUID_RX,
    write=True,
    capture=True,  # permite aguardar por escritas com await
)
aioble.register_services(servico_led)


def aplicar_comando(dados: bytes):
    """Interpreta o byte recebido do site e aciona o LED."""
    try:
        valor = dados.decode().strip()
    except Exception:
        return

    if valor == "1":
        led.value(1)
        print("LED ligado")
    elif valor == "0":
        led.value(0)
        print("LED desligado")
    else:
        print("Comando desconhecido:", valor)


async def tarefa_escrita():
    """Aguarda escritas na característica RX e aplica o comando."""
    while True:
        conexao, dados = await caracteristica_rx.written()
        aplicar_comando(dados)


async def tarefa_anuncio():
    """Anuncia o dispositivo via BLE para o navegador encontrar."""
    while True:
        print(f"Anunciando como '{NOME_DISPOSITIVO}'...")
        async with await aioble.advertise(
            250_000,
            name=NOME_DISPOSITIVO,
            services=[SERVICE_UUID],
        ) as conexao:
            print("Conectado a:", conexao.device)
            await conexao.disconnected()
            print("Desconectado.")


async def main():
    await asyncio.gather(
        tarefa_anuncio(),
        tarefa_escrita(),
    )


asyncio.run(main())
