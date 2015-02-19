create database IF NOT EXISTS calendar;
use calendar;

CREATE TABLE events
(id int auto_increment primary key,
 descrizione char(50) not null,
 startDate DATETIME not null,
 endDate DATETIME not null);

-- insert into events values (0,'ciao','2015-01-22','08:10:00',3)
