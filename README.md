# Calendar Web Service

Calendar is a RESTful web service that relies on a MySQL database to offer event management queries in a RESTful environment.

## Database

Calendar uses a database named CALENDAR and a table named EVENTS.

## Protocol specification

Uses JSON for data and offers a RESTful API. In every request and response, `Content-Type` must be `application/json`

API endpoints:

- `GET /` returns an array with all events stored
- `GET /<id>` returns the event with the given id
- `GET /day/<day>` returns an array with all events in a day
    - in this URL the API uses a DATE SQL object so time doesn't have to be specified
- `GET /<day1>/<day2>` returns an array with all events in a timespan
    - in this URL the API uses a DATETIME SQL object so the time must be specified and not only the date
- `DELETE /day/<day>` and `DELETE /<day1>/<day2>` are self explanatory
- `POST /` inserts a new event in the database
- `DELETE /<id>` deletes an event

### Examples

- `http GET calendar.url` returns a list of all events
- `http GET calendar.url/2015-03-28` returns a list of events that happen on the given day
- `http GET calendar.url/2015-03-28 09:00:00/2015-04-10 21:00:00` returns a list of events that overlap the given timespan
- `http POST calendar.url desc="Description of the event" startDate="2015-04-20 09:00:00" endDate="2015-04-20 11:00:00"` creates an event
- `http DELETE calendar.url/13` deletes the event with the `id` being 13

### Event data format

Example of an event:
```json
{
  "id": 1,
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

__Example:__

```json
{
  "port": "3000",
  "mysqlUser": "yourSqlUser",
  "mysqlHost": "192.168.0.100",
  "mysqlPassword": "yoursecretsqlpassword"
}
```

## Implementation

Node.js + MySQL

Node dependencies:

- `express` for handling http requests
- `body-parser` for parsing json in requests using an express middleware
- `mysql` for querying the database

## Credits

Built as a school project by [Enrico Fasoli](http://github.com/fazo96), Asjon Dalipaj, Stefano Frittoli, Gianluca Rocco, Matteo Cattaneo, Matteo Murelli.

### License

The MIT License (MIT)

Copyright (c) 2015 Enrico Fasoli, Asjon Dalipaj, Stefano Frittoli, Gianluca Rocco, Matteo Cattaneo, Matteo Murelli.


Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
