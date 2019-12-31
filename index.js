#!/usr/bin/env node
const StellarSdk = require("stellar-sdk");
const fetch = require("node-fetch");
const chalk = require("chalk");
const cmd = require("command-line-args");
const readlineSync = require("readline-sync");

const opts = cmd([
  { name: "issuer-seed", type: String },
  { name: "asset", type: String },
  { name: "issuer-amount", type: Number, defaultValue: 1000 },
  { name: "client-seed", type: String }
]);

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

const ASSET = opts["asset"];
const ISSUE_AMOUNT = opts["issuer-amount"];

function getPubKey(seed) {
  if (!seed) return null;
  return StellarSdk.Keypair.fromSecret(seed).publicKey();
}

console.log(
  chalk.green(
    `Creating ${ISSUE_AMOUNT} ${ASSET} from
   ${getPubKey(opts["issuer-seed"]) || "a random issuer"},
   to
   ${getPubKey(opts["client-seed"]) || "a new client account"}
   on Testnet
   `
  )
);
readlineSync.question("Continue? ");

const accounts = {};
async function createAccount(name) {
  const pair = opts[`${name}-seed`]
    ? StellarSdk.Keypair.fromSecret(opts[`${name}-seed`])
    : StellarSdk.Keypair.random();
  console.log(
    chalk.green(`========== Creating/funding ${name} account ==========`)
  );
  console.log("> Seed: " + pair.secret());
  console.log("> Pub : " + pair.publicKey());

  await fetch(`https://friendbot.stellar.org?addr=${pair.publicKey()}`);
  accounts[name] = pair;
  return pair;
}

async function generate() {
  const issuerKey = await createAccount("issuer");

  const asset = new StellarSdk.Asset(ASSET, issuerKey.publicKey());
  const fee = await server.fetchBaseFee();

  console.log(
    chalk.green("Creating trust-line and issuing to client account")
  );

  const clientKey = await createAccount("client");
  console.log(chalk.green(`Sending ${ISSUE_AMOUNT} ${ASSET} to client`));
  const clientAccount = await server.loadAccount(clientKey.publicKey());
  const sendToClientTx = new StellarSdk.TransactionBuilder(clientAccount, {
    fee,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset
      })
    )
    .addOperation(
      StellarSdk.Operation.payment({
        destination: clientKey.publicKey(),
        asset,
        amount: String(AMOUNT_TO_CLIENT),
        source: issuerKey.publicKey()
      })
    )
    .setTimeout(100)
    .build();
  sendToClientTx.sign(clientKey);
  sendToClientTx.sign(issuerKey);
  await server.submitTransaction(sendToClientTx);
}

function showAccountsCreated() {
  Object.keys(accounts).forEach(name => {
    console.log(
      chalk.green(
        `> ${name}: https://stellar.expert/explorer/testnet/account/${accounts[
          name
        ].publicKey()}`
      )
    );
  });
}

generate();
showAccountsCreated();