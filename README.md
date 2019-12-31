# create-stellar-token

Create a custom Stellar token on Testnet.  You can specify keys for any of the accounts used.  If no seed is specified random accounts will be created for you.  All parameters are optional.

`--issuer-seed=[seed]` Private key for the issuing account

`--client-seed=[seed]` Private key for a client account to receive assets.

`--asset=[code]` Asset name

`--issuer-amount=[number]` Amount of asset to issue

`--client-amount=[number]` Amount of asset to send to client

## Usage

`npx create-stellar-token`

`npx create-stellar-token --asset=MYUSD --issuer-amount=100000 --client-amount=100`