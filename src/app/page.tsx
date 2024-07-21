import LineChart from '@/components/LineChart';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

interface Movement {
  id: number;
  external_id: string;
  movement_date: string;
  shares_amount: number;
  clp_amount: number;
  fundsflow: 'CREDIT' | 'CHARGE';
  is_employer_payment: boolean;
}

interface Share {
  date: string;
  share_value: number;
}

async function getData() {
  const movementsData: Movement[] = await (await fetch(`${NEXT_PUBLIC_API_URL}/movements`, {
    next: {
      revalidate: 3600,
    },
    cache: 'no-cache',
  })).json();

  const shareData : Share = (await (await fetch(`${NEXT_PUBLIC_API_URL}/shares?latest=true`, {
    next: {
      revalidate: 3600,
    },
  })).json())[0];

  const totalInvested = movementsData
    .filter(item => item.is_employer_payment)
    .reduce((acc, item) => acc + item.clp_amount, 0);

  const totalInvestedCurrentValue = movementsData
    .filter(item => item.is_employer_payment)
    .reduce((acc, item) => acc + item.shares_amount, 0) * shareData.share_value;

  const totalBalance = movementsData
    .reduce((acc, item) => acc + (item.fundsflow === 'CREDIT' ? item.shares_amount : -item.shares_amount), 0) * shareData.share_value;

  const totalVariation = totalBalance - totalInvested;

  const totalShares = movementsData
    .reduce((acc, item) => acc + item.shares_amount, 0);

  return {
    totalInvested,
    totalInvestedCurrentValue,
    totalBalance,
    totalVariation,
    totalShares,
    movementsData,
    shareData
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
}

export default async function Home() {
  const { totalInvested, totalInvestedCurrentValue, totalBalance, totalVariation, totalShares, movementsData, shareData } = await getData();

  return (
    <div>
      <h1>Financial Dashboard</h1>
      <div>
        <h2>Line Graph of Amount Variations</h2>
        <LineChart movementData={movementsData} shareData={shareData} />
      </div>
      <div>
        <h2>Totals</h2>
        <p>Total Invested: {formatCurrency(totalInvested)}</p>
        <p>Total Invested Value: {formatCurrency(totalInvestedCurrentValue)}</p>
        <p>Total Variation: {formatCurrency(totalVariation)}</p>
        <p>Total Balance: {formatCurrency(totalBalance)}</p>
        <p>Total Shares: {totalShares.toFixed(2)}</p>
      </div>
    </div>
  );
}
