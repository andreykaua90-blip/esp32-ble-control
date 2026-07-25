#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Pino do LED embutido no ESP32-C3 (geralmente GPIO 8)
#define LED_PIN 8 

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;
bool deviceConnected = false;

// UUIDs padrão do serviço Nordic UART (NUS)
#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Dispositivo conectado!");
    };
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Dispositivo desconectado. Reiniciando transmissão...");
      // Reinicia a transmissão para permitir novas conexões
      pServer->getAdvertising()->start(); 
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      // Uso de String do Arduino para compatibilidade com versões novas do core
      String rxValue = pCharacteristic->getValue(); 

      if (rxValue.length() > 0) {
        char comando = rxValue[0];
        
        // Lógica invertida (Active LOW) comum do LED embutido do ESP32-C3
        if (comando == '1') {
          digitalWrite(LED_PIN, LOW);   // LOW acende o LED
          Serial.println("LED Ligado");
        } else if (comando == '0') {
          digitalWrite(LED_PIN, HIGH);  // HIGH apaga o LED
          Serial.println("LED Desligado");
        }
      }
    }
};

void setup() {
  Serial.begin(115200);
  
  // Configura o pino do LED e garante que ele inicie DESLIGADO (HIGH)
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  // Inicializa o dispositivo BLE com o nome que o site irá buscar
  BLEDevice::init("ESP32-C3-LED");

  // Cria o Servidor BLE
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Cria o Serviço BLE
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Cria a Característica para RECEBER dados (Write)
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID_RX,
                      BLECharacteristic::PROPERTY_WRITE
                    );

  pCharacteristic->setCallbacks(new MyCallbacks());

  // Inicia o serviço e a transmissão do sinal (Advertising)
  pService->start();
  pServer->getAdvertising()->start();
  
  Serial.println("ESP32-C3 pronto! Aguardando conexão via Web Bluetooth...");
}

void loop() {
  // Processamento via callbacks de interrupção
  delay(10);
}
