# Calendar Web Service

Calendar is a RESTful web service that relies on a MySQL database to offer event management queries in a RESTful environment.

## Database

Calendar uses a database named CALENDAR and a table named EVENTS.

## Protocol specification

Uses JSON for data and offers a RESTful API. In every request and response, `Content-Type` must be `application/json`

API endpoints:

- `GET events` returns an array with all events stored
- `GET events/<id>` returns the event with the given id
- `PUT events/<id>` modifies the event by replacing the given fields
- `GET events/day/<day>` returns an array with all events in a day
    - in this URL the API uses a DATE SQL object so time doesn't have to be specified
- `GET events/<day1>/<day2>` returns an array with all events in a timespan
    - in this URL the API uses a DATETIME SQL object so the time must be specified and not only the date
- `DELETE events/day/<day>` and `DELETE /<day1>/<day2>` are self explanatory
- `POST events` inserts a new event in the database
- `DELETE events/<id>` deletes an event

### Examples

- `http GET calendar.url/events` returns a list of all events
- `http GET calendar.url/events/2015-03-28` returns a list of events that happen on the given day
- `http GET calendar.url/events/2015-03-28 09:00:00/2015-04-10 21:00:00` returns a list of events that overlap the given timespan
- `http POST calendar.url/events { "description": "Description of the event", "startDate": "2015-04-20 09:00:00", "endDate": "2015-04-20 11:00:00" }` creates an event
- `http PUT calendar.url/events/7 { "description": "new Description of the event", "id": 24, "endDate": "2015-05-24 11:00:00" }` modifies the given fields of the event with `id` set to 7 
- `http DELETE calendar.url/events/13` deletes the event with the `id` being 13

### Event data format

Example of an event:
```json
{
  "id": 1,
  "description": "Meeting",
  "startDate": "2015-12-30 18:00:00",
  "endDate": "2015-12-30 20:00:00"
}
```

## Usage

- make sure you have `node.js` installed
- open a shell in the project directory and run `npm install` to install dependencies
- tune the `settings.json` file as needed to make sure the service can connect to your MySQL database
- if you want to run the HTML GUI then you will need to run `bower install` to install client-side libraries. If you don't have `bower`, you can install it globally with `npm install -g bower`. More information is available on [bower.io](http://bower.io)
- run the service by launching `node calendar.js`.

### Settings

Using `settings.json` you can customize the following:

- MySQL connection settings
- listening port for the service
- enabling or disabling the built-in html gui

__Example:__

```json
{
  "port": "3000",
  "mysqlUser": "yourSqlUser",
  "mysqlHost": "192.168.0.100",
  "mysqlPassword": "yoursecretsqlpassword",
  "enableGUI": true
}
```

## Implementation

Node.js + MySQL + Bower (on the client)

Node dependencies:

- `express` for handling http requests
- `body-parser` for parsing json in requests using an express middleware
- `mysql` for querying the database
- `chalk` for coloring the stdout
- `commander` for command line argument parsing

Bower dependencies (only necessary for the gui):
- `angular` for the frontend logic
- `jquery` for manipulating the dom
- `bootstrap` for the user interface
- `bootstrap-calendar` for the calendar views
- `sweetalert` for the alerts
- `moment` for managing dates and datetimes
 
## Credits

Built as a school project by [Enrico Fasoli](http://github.com/fazo96), Asjon Dalipaj, Stefano Frittoli, Gianluca Rocco, Matteo Cattaneo, Matteo Murelli.

### License

The MIT License (MIT)

Copyright (c) 2015 Enrico Fasoli, Asjon Dalipaj, Stefano Frittoli, Gianluca Rocco, Matteo Cattaneo, Matteo Murelli.


Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
