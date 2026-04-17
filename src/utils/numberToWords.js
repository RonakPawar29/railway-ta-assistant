/**
 * Converts numbers to Indian Currency Words
 */

export const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    const d = Math.floor(n / 10);
    const r = n % 10;
    return b[d] + (r > 0 ? ' ' + a[r] : '');
  };

  const convert = (n) => {
    if (n === 0) return 'Zero';
    
    let words = '';
    
    if (n >= 10000000) {
      words += convert(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    
    if (n >= 100000) {
      words += inWords(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    
    if (n >= 1000) {
      words += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    
    if (n >= 100) {
      words += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    
    if (n > 0) {
      if (words !== '') words += 'and ';
      words += inWords(n);
    }
    
    return words.trim();
  };

  return convert(Math.floor(num)) + ' Only';
};
