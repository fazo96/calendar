# Calendar Web Service Docs

Calendar is a RESTful web service that relies on a MySQL database to offer event management queries in a RESTful environment.

## Database

Calendar uses a database named CALENDAR and a table named EVENTS.

## Protocollo

Uses JSON for data and offers a RESTful API.

API endpoints:

- __GET /__ returns all events stored
- __GET /<day>__ returns all events in a day
- __GET /<day1>/<day2>__ returns all events in a timespan (doesn't work at the moment)
- __POST /__ inserts a new event in the database
- __DELETE /<id>__ deletes an event

### Event data format

```json
{
  "desc": "description_of_the_event",
  "startDate": "when the event starts('2015-12-01 18:00:00' for example)",
  "endDate": "when the event ends"
}
```

## Usage

- make sure you have `node.js` installed
- open a shell in the project directory and run `npm install` to install dependencies
- tune the `settings.json` file as needed to make sure the service can connect to your MySQL database
- run the service by launching `node calendar.js`.

## Impostazioni

Using `settings.json` you can customize the following:

- MySQL connection settings
- listening port for the service

## Implementazione

Node.js + MySQL
