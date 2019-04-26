import {
  BigDecimal,
  BigInt,
  EthereumBlock,
  EthereumCall
} from "@graphprotocol/graph-ts";

// Although imported from BAT, these can be used for all exchanges
import {
  TokenPurchase,
  EthPurchase,
  AddLiquidity,
  RemoveLiquidity
} from "../../generated/Factory/templates/Exchange/Exchange";

import { Exchange } from "../../generated/schema";

export function handleExchangeBlock(block: EthereumBlock): void {}

export function handleSetup(call: EthereumCall): void {}

export function handleTokenPurchase(event: TokenPurchase): void {
  let exchangeId = event.address.toHex();
  let exchange = Exchange.load(exchangeId);
  exchange.ethLiquidity = exchange.ethLiquidity + event.params.eth_sold;
  exchange.tokenLiquidity =
    exchange.tokenLiquidity - event.params.tokens_bought;
  exchange.save();
}

export function handleEthPurchase(event: EthPurchase): void {
  let exchangeId = event.address.toHex();
  let exchange = Exchange.load(exchangeId);
  exchange.ethLiquidity = exchange.ethLiquidity.minus(event.params.eth_bought);
  exchange.tokenLiquidity = exchange.tokenLiquidity.plus(
    event.params.tokens_sold
  );
}

export function handleAddLiquidity(event: AddLiquidity): void {
  let exchangeId = event.address.toHex();
  let exchange = Exchange.load(exchangeId);
  exchange.ethLiquidity = exchange.ethLiquidity.plus(event.params.eth_amount);
  exchange.tokenLiquidity = exchange.tokenLiquidity.plus(
    event.params.token_amount
  );
}

export function handleRemoveLiquidity(event: RemoveLiquidity): void {
  let exchangeId = event.address.toHex();
  let exchange = Exchange.load(exchangeId);
  exchange.ethLiquidity = exchange.ethLiquidity.minus(event.params.eth_amount);
  exchange.tokenLiquidity = exchange.tokenLiquidity.minus(
    event.params.token_amount
  );
}
