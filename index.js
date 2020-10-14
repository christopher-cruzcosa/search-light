require("console.table");
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "passwordA1",
  database: "lpc_search_lightDB"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log(`
  
Welcome to the le Phare Corporation's Human Resources Database
  
We want to be of help to all members of our corporate family.

Remember, like our corporate motto says, 'We See You!'

`)
  start();
});

function start() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees by Department",
        "View All Employees by Manager",
        "Add Employee",
        "Remove Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "exit"
      ]
    })
    .then(function (answer) {
      switch (answer.action) {
        case "View All Employees":
          viewAllEmployees();
          break;

        case "View All Employees by Department":
          viewEmployeesByDepartment();
          break;

        case "View All Employees by Manager":
          viewEmployeesByManager();
          break;

        case "Add Employee":
          // songSearch();
          break;


        case "Update Employee Role":
          // songSearch();
          break;


        case "Update Employee Manager":
          // songSearch();
          break;

        case "exit":
          connection.end();
          break;
      }
    });
};

function viewAllEmployees() {
  return connection.query(
    `Select subordinates.id
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
    on department.id = role.department_id;`,
    (err, results) => {
      if (err) {
        throw err;
      };
      console.log("");
      console.log("");
      console.table(results);
      console.log("");
      console.log("");
      return start();
    });
};

function viewEmployeesByDepartment() {
  return connection.query("SELECT department.name, department.id FROM department", (err, results) => {
    if (err) {
      throw err;
    }
    const departmentNames = results.map((row) => row.name);
    // once you have the items, prompt the user for which they'd like to bid on
    return inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: departmentNames,
          message: "Which department would you like to view?",
        }
      ])
      .then((answer) => {
        const chosenDepartment = results.find(
          (row) => row.name === answer.choice
        );

        return connection.query(
          `Select 
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
          where department.id = ?
          order by salary desc;`,

          chosenDepartment.id,
          (err, results) => {
            if (err) {
              throw err;
            }
            console.log("");
            console.log("");
            console.table(results);
            console.log("");
            console.log("");
            return start();
          }
        );
      });
  });
};

function viewEmployeesByManager() {
  return connection.query(`select distinct 
  concat(managers.first_name,' ', managers.last_name) as fullName
  , managers.id
  from employee as subordinates
  left join employee as managers
  on managers.id = subordinates.manager_id
  where subordinates.manager_id <> "" `, (err, results) => {
    if (err) {
      throw err;
    };
    console.log(results)
    const managerNames = results.map((row) => row.fullName);

    return inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: managerNames,
          message: "Which manager would you like to view?",
        }
      ])
      .then((answer) => {
        const chosenManager = results.find(
          (row) => row.fullName === answer.choice
        );

        return connection.query(
          `Select 
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
          where managers.id = ?
          order by role.salary desc;`, chosenManager.id,
          (err, results) => {
            if (err) {
              throw err;
            }
            console.log("");
            console.log("");
            console.table(results);
            console.log("");
            console.log("");
            return start();
          }
        );
      });
  });
};