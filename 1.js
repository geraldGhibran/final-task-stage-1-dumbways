// 1.Seorang investor menginvestasikan modalnya sebesar 1 miliar ke beberapa instrumen keuangan.
// 350 juta ditempatkan ke deposito bank dengan keuntungan 3,5% per tahun, sedangkan 650 juta ditempatkan
// di obligasi negara sebesar 30% dengan keuntungan 13% per tahun, 35% ditempatkan di saham A dengan keuntungan 14,5% per tahun,
//  dan sisanya ditempatkan di saham B dengan keuntungan 12,5% per tahun. Buatlah sebuah fungsi yang menghitung dan mencetak total
//  uang investor setelah dua tahun.

function checkInvestmentProfit(
    initialInvesment,
    initialInvestment2,
    investmentYear
  ) {
    // bank deposit profit
    const percentage1 = 3.5 / 100;
  
    const bankDepositProfit = initialInvesment * percentage1 * investmentYear;
  
    // obligation profit
  
    obligationCapital = initialInvestment2 * (30 / 100);
  
    percentage2 = 13 / 100;
  
    const obligationProfit = obligationCapital * percentage2 * investmentYear;
  
    // stock A profit
  
    const stockACapital = initialInvestment2 * (35 / 100);
  
    const percentage3 = 14.5 / 100;
  
    const stockAProfit = stockACapital * percentage3 * investmentYear;
  
    // stock B profit
  
    const stockBCapital = initialInvestment2 * (35 / 100);
  
    const stockBProfit = stockBCapital * investmentYear * (12.5 / 100);
  
    // total all profit
  
    const totalProfitCount =
      initialInvesment +
      initialInvestment2 +
      bankDepositProfit +
      stockBProfit +
      stockAProfit +
      obligationProfit;
  
    return (
      "Maka uang investor setelah " +
      investmentYear +
      " tahun adalah " +
      totalProfitCount.toFixed(0)
    );
  }
  
  console.log(checkInvestmentProfit(350000000, 650000000, 2));
  