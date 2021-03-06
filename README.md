# Uniswap-subgraph
[Uniswap](https://uniswap.io/) is a decentralized protocol for automated token exchange on Ethereum.

## Events and Contracts

The Uniswap smart contracts are set up so that the `uniswap_factory` can create many different exchanges, and each exchange represents a contract that allows users to swap ETH and the chosen Token. The contracts are written in Vyper, and can be found [here](https://github.com/Uniswap/contracts-vyper/tree/master/contracts)

Most events are included and tracked in the subgraph. The following events were not tracked:

* `Approval` - Not core to the protocol, and has not been called yet on any of the UNI-token shares (which use the ERC-20 interface). 

This subgraph can be used for Uniswap on the mainnet, and all testnets. In order to run it for a 
testnet, the `subgraph.yaml` file will need to have the contract addresses changed to point to the 
correct address for each respective network.

The subgraph takes ~2 hours to sync. 

## Brief Description of The Graph Node Setup

A Graph Node can run multiple subgraphs. The subgraph ingests event data by calling to Infura through http. It can also connect to any geth node or parity node that accepts RPC calls. Fast synced geth nodes work. To use parity, the `--no-warp` flag must be used. Setting up a local Ethereum node is more reliable and faster, but Infura is the easiest way to get started. 

This subgraph has three types of files which tell the Graph Node to ingest events from specific contracts. They are:
* The subgraph manifest (subgraph.yaml)
* A GraphQL schema      (schema.graphql)
* Mapping scripts       (exchange.ts, factory.ts) 

This repository has these files created and ready to compile, so a user can start this subgraph on their own. The only thing that needs to be edited is the contract addresses in the `subgraph.yaml` file to change between mainnet and testnets.  

We have provided a quick guide on how to start up the Uniswap-Subgraph graph node below. If these steps aren't descriptive enough, the [getting started guide](https://github.com/graphprotocol/graph-node/blob/master/docs/getting-started.md) has in depth details on running a subgraph. 

## Steps to Deploying The Uniswap-Subgraph Locally 
  1. Install IPFS and run `ipfs init` followed by `ipfs daemon`
  2. Install PostgreSQL and run `initdb -D .postgres` followed by `pg_ctl -D .postgres start` and `createdb uniswap-subgraph-mainnet` (note this db name is used in the commands below for the mainnet examples)
  3. If using Ubuntu, you may need to install additional packages: `sudo apt-get install -y clang libpq-dev libssl-dev pkg-config`
  4. Clone this repository, and run the following:
     * `yarn`
     * `yarn codegen` 
  5. Clone https://github.com/graphprotocol/graph-node from master and `cargo build` (this might take a while)
  6. a) Now that all the dependencies are running, you can run the following command to connect to Infura Mainnet (it may take a few minutes for Rust to compile). PASSWORD might be optional, it depends on your postrgres setup:

```
  cargo run -p graph-node --release -- \
  --postgres-url postgresql://USERNAME:[PASSWORD]@localhost:5432/mainnet-uniswap-subgraph \
  --ipfs 127.0.0.1:5001 \
  --ethereum-rpc mainnet-infura:https://mainnet.infura.io --debug
```
  6. b) Or Mainnet with a Local Ethereum node. This is very common if you are working with brand new contracts, and you have deployed them to a testnet environment like *ganache* (note that ganache commonly uses port 9545 rather than 8545):
```
  cargo run -p graph-node --release -- \
  --postgres-url postgresql://USERNAME:[PASSWORD]@localhost:5432/mainnet-uniswap-subgraph \
  --ipfs 127.0.0.1:5001 \
  --ethereum-rpc mainnet-local:http://127.0.0.1:8545 
```
  6. c) Or Infura Rinkeby _(NOTE: Infura testnets are not reliable right now, we get inconsistent results returned. If Rinkeby data is needed, it is suggested to run your own Rinkeby node)_
```
    cargo run -p graph-node --release --   \
    --postgres-url postgresql://USERNAME:[PASSWORD]@localhost:5432/uniswap-rinkeby-subgraph \
    --ipfs 127.0.0.1:5001 \
    --ethereum-rpc rinkeby-infura:https://rinkeby.infura.io 

```
  
 7. Now create the subgraph locally on The Graph Node with `yarn create-local`. On The Graph Hosted service, creating the subgraph is done in the web broswer. 

 8. Now deploy the uniswap subgraph to The Graph Node with `yarn deploy --verbosity debug`. You should see a lot of blocks being skipped in the `graph-node` terminal, and then it will start ingesting events from the moment the contracts were uploaded to the network. 

Now that you have subgraph is running you may open a [Graphiql](https://github.com/graphql/graphiql) browser at `127.0.0.1:8000` and get started with querying.

## Viewing the Subgraph on the Graph Hosted Service
This subgraph has already been deploy to the hosted service, and you can see it under on [The Graph Explorer](https://thegraph.com/explorer/). To understand how deploying to the hosted service works, check out the [Deploying Instructions](https://thegraph.com/docs/deploy-a-subgraph) in the official documentation. The most important part of deploying to the hosted service is ensuring that the npm script for `deploy` is updated to the correct name that you want to deploy with. 

## Getting started with querying 
Below are a few ways to show how to query the uniswap-subgraph for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://github.com/graphprotocol/graph-node/blob/master/docs/graphql-api.md). These queries can be used locally or in The Graph Explorer playground.

### Querying a Uniswap Exchange
This query fetches high level information on each uniswap exchange contract. 
```graphql
{
  exchange(id: "0x077d52b047735976dfda76fef74d4d988ac25196") {
    id
    tokenAddress
    tokenSymbol
    tokenName
    tokenDecimals
    price
    fee
    version
    ethLiquidity
    ethDecimals
    tokenLiquidity
    startTime
    endTime
    highPrice
    lowPrice
    weightedAvgPrice
    price
    priceChangePercent
    lastTradePrice
    lastTradeEthQty
    lastTradeErc20Qty
    tradeVolume
    totalValue
    tradeCount
    totalUniToken
    factoryID
  }
  exchanges(where: {tokenSymbol: "DAI"}) {
    price
    tokenSymbol
  }
}
```

### Querying User Transactions
This query fetches a user trading Dai between two timestamps, and returns a maximum of ten of their transactions. 
```graphql
{
  transactions(where: {timeStamp_gt: 1544832000, timeStamp_lt: 1545696000, 
    tokenSymbol: "DAI", userAddress:"0x85c5c26dc2af5546341fc1988b9d178148b4838b"}, first: 10) {
    id
    exchangeAddress
    userAddress
    block
    ethAmount
    tokenAmount
    fee
    event
    timeStamp
  }
}
```

### Querying User Balances and Liquidity Information
This query fetches 10 users, and all of their uniswap exchange information (i.e. DAI, MKR, etc.). 
```graphql
{
  users(first: 10){
    id
    exchangeBalances{
      id
      userAddress
      exchangeAddress
      ethDeposited
      tokensDeposited
      uniTokensMinted
      uniTokensBurned
      ethWithdrawn
      tokensWithdrawn
      ethBought
      tokensBought
      totalEthFeesPaid
      totalTokenFeesPaid
    }
  }
}
```