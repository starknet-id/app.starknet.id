import Big from "big.js";
import { CurrenciesRange, CurrencyType } from "./constants";
import { applyRateToBigInt } from "./feltService";
import { getPriceFromDomain } from "./priceService";
import { Result } from "starknet";

export const getTokenQuote = async (tokenAddress: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/get_altcoin_quote?erc20_addr=${tokenAddress}`
    );
    return await res.json();
  } catch (error) {
    console.log("Error querying quote from server: ", error);
  }
};

export const getDomainPriceAltcoin = (quote: string, priceInEth: string) => {
  if (quote === "1") return priceInEth;

  const priceBigInt = new Big(priceInEth);
  const quoteBigInt = new Big(quote);
  const scaleFactor = new Big(10 ** 18);

  const price = priceBigInt
    .mul(quoteBigInt)
    .div(scaleFactor)
    .round(0)
    .toString();

  return price;
};

export const getLimitPriceRange = (
  type: CurrencyType,
  price: bigint
): bigint => {
  switch (type) {
    case CurrencyType.ETH:
      return price;
    case CurrencyType.STRK:
      return (
        price +
        BigInt(applyRateToBigInt(price, parseFloat(CurrenciesRange.STRK)))
      );
    // case CurrencyType.USDC:
    //   return (
    //     price +
    //     BigInt(applyRateToBigInt(price, parseFloat(CurrenciesRange.USDC)))
    //   );
    // case CurrencyType.USDT:
    //   return (
    //     price +
    //     BigInt(applyRateToBigInt(price, parseFloat(CurrenciesRange.USDT)))
    //   );
    default:
      return price;
  }
};

export const getRenewalPriceETH = (
  priceError: Error | null,
  priceData: Result | undefined,
  domain: string,
  duration: number
): string => {
  if (priceError || !priceData) return getPriceFromDomain(1, domain).toString();
  else {
    // Divide the priceData by the duration to get the renewal price
    const high = priceData?.["price"].high << BigInt(128);
    const price = priceData?.["price"].low + high;
    const renew = price / BigInt(duration);
    return renew.toString(10);
  }
};

export const getDomainPrice = (
  domain: string,
  currencyType: CurrencyType,
  quote?: string
): string => {
  if (currencyType === CurrencyType.ETH) {
    return getPriceFromDomain(1, domain).toString();
  } else {
    return getDomainPriceAltcoin(
      quote as string,
      getPriceFromDomain(1, domain).toString()
    );
  }
};

// function to compute the limit price for the auto renewal contract
// depending on the token selected by the user
export const getAutoRenewAllowance = (
  currencyType: CurrencyType,
  salesTaxRate: number,
  domainPrice: string
): string => {
  const limitPrice = getLimitPriceRange(currencyType, BigInt(domainPrice));
  const allowance: string = salesTaxRate
    ? (
        BigInt(limitPrice) + BigInt(applyRateToBigInt(limitPrice, salesTaxRate))
      ).toString()
    : limitPrice.toString();

  return allowance;
};
