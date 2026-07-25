// ============================================
// Lógica de conexão BLE com o ESP32-C3
// (idêntica à versão original — não alterada)
// ============================================

// Mesmos UUIDs configurados no ESP32-C3
const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const CHARACTERISTIC_UUID_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

let dispositivoBluetooth = null;
let caracteristicaRx = null;

async function conectarBLE() {
    const statusDiv = document.getElementById('status');
    statusDiv.innerText = "Buscando dispositivo...";

    try {
        // Solicita ao navegador a busca pelo dispositivo com o nome correto
        dispositivoBluetooth = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'ESP32-C3-LED' }],
            optionalServices: [SERVICE_UUID]
        });

        statusDiv.innerText = "Conectando ao servidor GATT...";
        const server = await dispositivoBluetooth.gatt.connect();

        statusDiv.innerText = "Buscando o serviço...";
        const service = await server.getPrimaryService(SERVICE_UUID);

        statusDiv.innerText = "Buscando a característica...";
        caracteristicaRx = await service.getCharacteristic(CHARACTERISTIC_UUID_RX);

        statusDiv.innerText = "Status: Conectado com Sucesso!";
        document.getElementById('onBtn').disabled = false;
        document.getElementById('offBtn').disabled = false;
        document.getElementById('connectBtn').disabled = true;

        // Detecta se o usuário desconectar manualmente pelo navegador
        dispositivoBluetooth.addEventListener('gattserverdisconnected', onDisconnected);

    } catch (error) {
        console.log("Erro: " + error);
        statusDiv.innerText = "Falha na conexão. Tente novamente.";
    }
}

async function enviarComando(valor) {
    if (caracteristicaRx) {
        try {
            // Transforma a string ('1' ou '0') em um array de bytes (Uint8Array)
            const encoder = new TextEncoder();
            const dados = encoder.encode(valor);
            await caracteristicaRx.writeValue(dados);
            console.log(`Comando '${valor}' enviado com sucesso!`);
        } catch (error) {
            console.error("Erro ao enviar dado:", error);
        }
    }
}

function onDisconnected() {
    document.getElementById('status').innerText = "Status: Desconectado";
    document.getElementById('onBtn').disabled = true;
    document.getElementById('offBtn').disabled = true;
    document.getElementById('connectBtn').disabled = false;
}
