import { BigInt, EthereumBlock } from "@graphprotocol/graph-ts";

import { NewExchange } from "../../generated/Factory/Factory";
import { Exchange as ExchangeTemplate } from "../../generated/Factory/templates";
import { Directory, Exchange } from "../../generated/schema";

export function handleFactoryBlock(block: EthereumBlock): void {}

export function handleNewExchange(event: NewExchange): void {
  // Create the uniswap directory on demand
  let directory = Directory.load("uniswap");
  if (directory == null) {
    directory = new Directory("uniswap");
    directory.exchangeCount = 0;
  }
  directory.exchangeCount += 1;
  directory.save();

  // Create the exchange entity
  let id = event.params.exchange.toHex();
  let exchange = new Exchange(id);
  exchange.directory = "uniswap";
  exchange.tokenAddress = event.params.token;
  exchange.ethLiquidity = BigInt.fromI32(0);
  exchange.tokenLiquidity = BigInt.fromI32(0);
  exchange.save();

  // Start indexing the exchange
  ExchangeTemplate.create(event.params.exchange);
}
