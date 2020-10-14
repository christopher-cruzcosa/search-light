//dependencies

require("console.table");
var mysql = require("mysql");
var inquirer = require("inquirer");

//creating the main mySQL connection
var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "passwordA1",
  database: "lpc_search_lightDB"
});

//making the connectio and starting the app
connection.connect(function (err) {
  if (err) throw err;
  console.log(`
  
Welcome to the le Phare Corporation's Human Resources Database
  
We want to be of help to all members of our corporate family.

Remember, like our corporate motto says, 'We See You!'

`)
  start();
});

//this first function controls the start menu of options
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
          addEmployee();
          break;

        case "Remove Employee":
          deleteEmployee();
          break;


        case "Update Employee Role":
          updateEmployeeRole();
          break;


        case "Update Employee Manager":
          updateEmployeeManager();
          break;

        case "exit":
          connection.end();
          break;
      }
    });
};

//this function controls runs a query to show all employees, along with their manager, role, and department
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

//this function controls runs a query to show all deparmemts, makes the user choose one, and then uses that choice to make a query to
// disaply all employees of that department
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
          where department.id = ? and subordinates.first_name <> ""
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

//this function controls runs a query to show all managers, makes the user choose one, and then uses that choice to make a query to
// disaply all employees of that manager
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

//this function prompts the user to input some answers, like name, and then runs queries to show all roles and all employees, to allow the user to creat new employee record
//with the input names, the chosen role, and the chosen employee as their manager
function addEmployee() {
  return connection.query(`
  select distinct 
  role.id
  , role.title
  from role;`, (err, results1) => {
    if (err) {
      throw err;
    };

    const roleNames = results1.map((row) => row.title);

    return connection.query(`
    select distinct 
    employee.id
    , CONCAT(employee.first_name," ",employee.last_name) as name
    from employee;`, (err, results2) => {
      if (err) {
        throw err;
      };

      const managerNames = results2.map((row) => row.name);

      return inquirer
        .prompt([
          {
            name: "firstName",
            type: "input",
            message: "What is the first name of the employee?",
          },
          {
            name: "lastName",
            type: "input",
            message: "What is the last name of the employee?",
          },
          {
            name: "role",
            type: "list",
            message: "What job title does the employee have?",
            choices: roleNames,
          },
          {
            name: "manager",
            type: "list",
            message: "Which manager does the employee have?",
            choices: managerNames,
          }
        ])
        .then((answers) => {
          const chosenRole = results1.find(
            (row) => row.title === answers.role
          );
          const chosenManager = results2.find(
            (row) => row.name === answers.manager
          );

          return connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: answers.firstName,
              last_name: answers.lastName,
              role_id: chosenRole.id,
              manager_id: chosenManager.id
            },
            (err) => {
              if (err) {
                throw err;
              }
              console.log("");
              console.log("");
              return start();
            }
          );
        });
    });
  });
};


//this function controls runs a query to choose an employee, and then select a role, and that role overrides the previous role for the employee
function updateEmployeeRole() {
  return connection.query(`
  select distinct 
  employee.id as id
  , CONCAT(employee.first_name," ",employee.last_name) as name
  from employee;`, (err, results1) => {
    if (err) {
      throw err;
    };

    const employeeNames = results1.map((row) => row.name);

    return inquirer
      .prompt([
        {
          name: "employee",
          type: "list",
          message: "Which employee record do you wish to modify?",
          choices: employeeNames,
        }
      ])
      .then((answers) => {

        const chosenEmployee = results1.find(
          (row) => row.name === answers.employee
        );

        return connection.query(`
          select distinct role.id as id, role.title from role;`, (err, results2) => {
          if (err) {
            throw err;
          };

          const roleTitles = results2.map((row) => row.title);

          return inquirer
            .prompt([
              {
                name: "role",
                type: "list",
                message: "Which role do you want to assign to the employee?",
                choices: roleTitles,
              }
            ])
            .then((answers) => {

              const chosenRole = results2.find(
                (row) => row.title === answers.role
              );

              return connection.query(
                "Update employee SET employee.role_id = ? where employee.id = ?",
                [chosenRole.id, chosenEmployee.id],
                (err) => {
                  if (err) {
                    throw err;
                  }
                  console.log("");
                  console.log("");
                  return start();
                }
              );

            });

        });

      });
  })
};

//this function controls runs a query to choose an employee, and then select a new manager, and that manager choice overrides the previous manager for the employee
function updateEmployeeManager() {
  return connection.query(`
  select distinct 
  employee.id as id
  , CONCAT(employee.first_name," ",employee.last_name) as name
  from employee;`, (err, results1) => {
    if (err) {
      throw err;
    };

    const employeeNames = results1.map((row) => row.name);

    return inquirer
      .prompt([
        {
          name: "employee",
          type: "list",
          message: "Which employee record do you wish to modify?",
          choices: employeeNames,
        }
      ])
      .then((answers) => {

        const chosenEmployee = results1.find(
          (row) => row.name === answers.employee
        );

        return connection.query(`
        select distinct 
        employee.id
        , CONCAT(employee.first_name," ",employee.last_name) as name
        from employee
        where id <> ?;`, chosenEmployee.id, (err, results2) => {
          if (err) {
            throw err;
          };

          const managerNames = results2.map((row) => row.name);

          return inquirer
            .prompt([
              {
                name: "manager",
                type: "list",
                message: "Which person do you want to assign as the employee's manager?",
                choices: managerNames,
              }
            ])
            .then((answers) => {

              const chosenManager = results2.find(
                (row) => row.name === answers.manager
              );

              return connection.query(
                "Update employee SET employee.manager_id = ? where employee.id = ?",
                [chosenManager.id, chosenEmployee.id],
                (err) => {
                  if (err) {
                    throw err;
                  }
                  console.log("");
                  console.log("");
                  return start();
                }
              );

            });

        });

      });
  })
};

//this function controls runs a query to choose an employee, and then asks them to reconfirm, and then if yes deletes the employee record
function deleteEmployee() {
  return connection.query(`
  select distinct 
  employee.id as id
  , CONCAT(employee.first_name," ",employee.last_name) as name
  from employee;`, (err, results1) => {
    if (err) {
      throw err;
    };

    const employeeNames = results1.map((row) => row.name);

    return inquirer
      .prompt([
        {
          name: "employee",
          type: "list",
          message: "Which employee record do you wish to delete?",
          choices: employeeNames,
        },
        {
          name: "confirm",
          type: "list",
          message: "Are you really very sure?",
          choices: ["yes, I am", "no, nevermind"],
        },
      ])
      .then((answers) => {

        const chosenEmployee = results1.find(
          (row) => row.name === answers.employee
        );

        switch (answers.confirm) {
          case "yes, I am":

            return connection.query(
              "Delete from employee where employee.id = ?", chosenEmployee.id, (err) => {
                if (err) {
                  throw err;
                }
                console.log("");
                console.log("");
                return start();
              }
            );

          default:
            console.log("");
            console.log("");
            return start();
        }

      });
  })
}




