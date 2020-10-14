-- DROP DATABASE IF EXISTS lpc_search_lightDB;

-- CREATE DATABASE lpc_search_lightDB;

use lpc_search_lightDB;

create table department(
id int PRIMARY KEY auto_increment,
name varchar(30) not null
);

create table role(
id int PRIMARY KEY auto_increment,
title varchar(30) not null,
salary decimal (10,2) not null,
department_id int,
foreign key (department_id) references department (id)
);

create table employee(
id int PRIMARY KEY auto_increment,
first_name varchar(30) not null,
last_name varchar(30) not null,
role_id int,
manager_id int,
foreign key (role_id) references role (id)
);

select * from department;
Select * from employee;

Select subordinates.id
,subordinates.first_name
,subordinates.last_name
, role.title as 'job title'
, department.name as department
, role.salary
, concat(managers.first_name,' ', managers.last_name) as manager 
from employee as subordinates
left join employee as managers
on subordinates.manager_id = managers.id
inner join role
on subordinates.role_id = role.id
inner join department
on department.id = role.department_id;

-- Select subordinates.id
-- ,subordinates.first_name
-- ,subordinates.last_name
-- , role.title as 'job title'
-- , department.name as department
-- , role.salary
-- , concat(managers.first_name,' ', managers.last_name) as manager 
-- from employee as subordinates
-- left join role
-- on subordinates.role_id = role.id
-- where role.department_id = 1 
-- inner join department
-- on department.id = role.department_id
-- left join employee as managers
-- on subordinates.manager_id = managers.id;


Select 
subordinates.id
,subordinates.first_name
,subordinates.last_name
 ,role.title as 'job title'
, department.name as department
, role.salary
, concat(managers.first_name,' ', managers.last_name) as manager 
from department 
right join role 
on role.department_id = department.id
left join employee as subordinates
on subordinates.role_id = role.id
left join employee as managers
on subordinates.manager_id = managers.id
where department.id = 2
order by salary desc;

Select 
subordinates.id
,subordinates.first_name
,subordinates.last_name
 ,role.title as 'job title'
, department.name as department
, role.salary
, concat(managers.first_name,' ', managers.last_name) as manager 
from employee as managers
right join employee as subordinates
on subordinates.manager_id = managers.id
left join role
on subordinates.role_id = role.id
left join department
on department.id = role.department_id
where managers.id = 4
order by role.salary desc
;


select distinct concat(managers.first_name,' ', managers.last_name) as name from employee as subordinates
left join employee as managers
on managers.id = subordinates.manager_id;


select distinct 
  concat(managers.first_name,' ', managers.last_name) as name
  , managers.id 
  from employee as subordinates
  left join employee as managers
  on managers.id = subordinates.manager_id;


select distinct 
  concat(managers.first_name,' ', managers.last_name) as fullName
  , managers.id
  from employee as subordinates
  inner join employee as managers
  on managers.id = subordinates.manager_id
  where subordinates.manager_id <> "" ;