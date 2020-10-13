DROP DATABASE IF EXISTS lpc_search_lightDB;

CREATE DATABASE lpc_search_lightDB;

use lpc_search_lightDB;

create table department(
id int PRIMARY KEY auto_increment,
name varchar(30) not null
);

create table role(
id int PRIMARY KEY auto_increment,
title varchar(30) not null,
salary decimal (10,2) not null,
deparment_id int
);

create table employee(
id int PRIMARY KEY auto_increment,
first_name varchar(30) not null,
last_name varchar(30) not null,
deparment_id int,
manager_id int
);

select * from songs;