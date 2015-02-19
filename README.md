# Calendar Web Service Docs

Calendar is a RESTful web service that relies on a MySQL database to offer event management queries in a RESTful environment.

## Database

Calendar uses a database named CALENDAR and a table named EVENTS.

## Protocol specification

Uses JSON for data and offers a RESTful API. In every request and response, `Content-Type` must be `application/json`

API endpoints:

- `GET /` returns an array with all events stored
- `GET /<day>` returns an array with all events in a day
- `GET /<day1>/<day2>` returns an array with all events in a timespan
- `POST /` inserts a new event in the database
- `DELETE /<id>` deletes an event

### Event data format

Example of an event:
```json
{
  "desc": "Meeting in Room #3",
  "startDate": "2015-12-30 18:00:00",
  "endDate": "2015-12-30 20:00:00"
}
```

## Usage

- make sure you have `node.js` installed
- open a shell in the project directory and run `npm install` to install dependencies
- tune the `settings.json` file as needed to make sure the service can connect to your MySQL database
- run the service by launching `node calendar.js`.

### Settings

Using `settings.json` you can customize the following:

- MySQL connection settings
- listening port for the service

## Implementation

Node.js + MySQL

Node dependencies:

- `express` for handling http requests
- `body-parser` for parsing json in requests automatically with an 
- `mysql` for querying the database
