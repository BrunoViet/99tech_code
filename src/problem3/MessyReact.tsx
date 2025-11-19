import React, { useMemo } from 'react';
import type { BoxProps } from '@mui/material/Box';

interface WalletBalance {
  currency: string;
  blockchain: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number =>
  PRIORITY_MAP[blockchain] ?? -1;

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority >= 0 && balance.amount > 0;
      })
      .sort(
        (lhs: WalletBalance, rhs: WalletBalance) =>
          getPriority(rhs.blockchain) - getPriority(lhs.blockchain),
      )
      .map((balance: WalletBalance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        return {
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue,
        };
      });
  }, [balances, prices]);

  return (
    <div {...rest}>
      {formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={balance.currency}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </div>
  );
};