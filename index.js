const figlet = require("figlet");
const chalk = require("chalk");
const clear = require("clear");
const inquirer = require("inquirer");
const log = console.log;
const { spawn } = require("child_process");
const openssl = require("openssl-nodejs");
const fs = require("fs");

//User provided data
let facilityNumber = "";
let clientShortName = "";

//Constants
const KEY_NAME = "my.key";

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

  generateKey(KEY_NAME);
};

const showWelcome = () => {
  clear();
  log(chalk.yellow(figlet.textSync("AC CertGen")));
};

const generateKey = (_filename) => {
  if (fs.existsSync("./openssl/" + _filename)) {
    console.log(chalk.yellow("Key file already exists."));
    // fs.unlinkSync("./openssl/" + _filename);
    fs.unlink("./openssl/" + _filename, (e) => {
      e
        ? console.log(chalk.red(e))
        : console.log(chalk.green("Old key file deleted successfully."));
    });
  }

  openssl(`genrsa -out ${KEY_NAME} 2048`, function (err, buffer) {
    log(chalk.yellowBright(err.toString()));
    log(chalk.green(buffer.toString()));

    if (fs.existsSync("./openssl/" + KEY_NAME)) {
      console.log(chalk.green("New key generated successfully."));
      requestCertificate();
    } else console.log(chalk.red(`${KEY_NAME} was not generated.`));
  });
};

const requestCertificate = () => {
  openssl(
    `req -new -x509 -days 365 -key ${KEY_NAME} -out APT${facilityNumber}.${clientShortName}.crt -subj /CN=APT${facilityNumber}.${clientShortName} -sha256 -extensions v3_req`,
    function (err, buffer) {
      log(chalk.yellowBright(err.toString()));
      log(chalk.green(buffer.toString()));
      if (
        fs.existsSync(`./openssl/APT${facilityNumber}.${clientShortName}.crt`)
      ) {
        console.log(chalk.green(".crt generated successfully."));
        exportPfx();
      } else console.log(chalk.red(`.crt was not generated.`));
    }
  );
};

const exportPfx = () => {
  openssl(
    `pkcs12 -export -out APT${facilityNumber}.${clientShortName}.pfx -inkey ${KEY_NAME} -in APT${facilityNumber}.${clientShortName}.crt -name "APT${facilityNumber}.${clientShortName}" -passout pass:`,
    function (err, buffer) {
      log(chalk.yellowBright(err.toString()));
      log(chalk.green(buffer.toString()));
      if (
        fs.existsSync(`./openssl/APT${facilityNumber}.${clientShortName}.pfx`)
      ) {
        console.log(chalk.green(".pfx generated successfully."));
      } else console.log(chalk.red(`.pfx was not generated.`));
    }
  );
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
