const figlet = require("figlet");
const chalk = require("chalk");
const clear = require("clear");
const inquirer = require("inquirer");
const log = console.log;
const { spawn } = require("child_process");
const openssl = require("openssl-nodejs");

//User provided data
let facilityNumber = "";
let clientShortName = "";

const runCLI = async () => {
  showWelcome();
  log(chalk.cyan("AC CertGen CLI initialized successfully."));
  const facilityInfo = await askForFacilityInformation();
  facilityNumber = facilityInfo.fnum;
  clientShortName = facilityInfo.client;
  log(
    chalk.cyan(
      `Generating certificates for client ${clientShortName} on F${facilityNumber}.`
    )
  );

  openssl("openssl genrsa -out ../output/my.key 2048", function (err, buffer) {
    log(chalk.yellow(err.toString()));
    log(chalk.green("buffah " + buffer.toString()));
  });
};

const showWelcome = () => {
  clear();
  log(chalk.yellow(figlet.textSync("AC CertGen")));
};

const askForFacilityInformation = () => {
  const questions = [
    {
      name: "fnum",
      type: "input",
      message: "Enter your facility number: ",
      default: "1234567",
      validate: function (value) {
        if (!value.length || value.length !== 7) {
          return "Facility number must be 7 characters long.";
        }
        return true;
      },
    },
    {
      name: "client",
      type: "input",
      message: "Enter your Advanced connector client short name: ",
      default: "1",
      validate: function (value) {
        if (!value.length || value.length > 5) {
          return "Client short name must be 1-5 chars long.";
        }
        return true;
      },
    },
  ];

  return inquirer.prompt(questions);
};

runCLI();
