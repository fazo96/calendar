create database IF NOT EXISTS calendar;
use calendar;

CREATE TABLE events
(id int auto_increment primary key,
 descrizione char(50) not null,
 date DATE not null,
 time TIME not null,
 durata INT not null);

-- insert into events values (0,'ciao','2015-01-22','08:10:00',3)
