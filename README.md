# Documentazione Servizio Web Calendario

- Il software si controlla tramite richieste HTTP
- utilizza un database MySQL

## Database

Tabelle:

- Eventi
- Regole?

## Protocollo

- Risponde usando JSON per i dati

Operazioni

- elenco eventi in una giornata
- momento occupato?
- periodo occupato?
- inserisci
- elimina

## Utilizzo

- assicurarsi di avere `node.js` installato sulla macchina
- aprire una shell nella directory del progetto e lanciare `npm install` per installare le dipendenze
- assicurarsi di aver configurato correttamente le impostazioni del software tramite il file `settings.json` come documentato nella sezione "Impostazioni" di questo documento
- avviare il software lanciando `node calendar.js`.

## Impostazioni

Tramite il file `settings.json` è possibile personalizzare il funzionamento del software, tra cui:

- nome utente, hostname/IP, porta e password per la connessione al dbms SQL
- porta di ascolto per le richieste HTTP

## API

Definizione specifica delle API:

### Add

Aggiunge un evento alla lista di eventi globale

URL: /add/desc&date&time&duration

- desc (stringa): descrizione dell'evento
- date (data): data nel formato 2015-01-05, 2015-12-29 (anno-mese-giorno)
- time (orario): orario nel formato 09:05:00 (ore:minuti:secondi)
- duration (intero): durata in ore

Esempio: "[service-url]/add/evento di test&2015-01-20&08:00:00&2"

## Implementazione

Node.js + MySQL

## Sviluppo

Il progetto ha delle dipendenze su pacchetti disponibile nel registro di npm (node package manager). Npm è incluso insieme alla distribuzione di node.

Per poter eseguire il software, aprire una shell nella directory del progetto e lanciare il comando `npm install`: npm leggerà le informazioni contenute in `package.json` e installerà le dipendenze necessarie automaticamente.
