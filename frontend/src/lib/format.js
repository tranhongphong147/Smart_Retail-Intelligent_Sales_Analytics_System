const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

const compactCurrency = new Intl.NumberFormat('vi-VN', {
  notation: 'compact',
  maximumFractionDigits: 1
});

const number = new Intl.NumberFormat('vi-VN');

export function formatCurrency(value) {
  return currency.format(Number(value || 0));
}

export function formatCompactMoney(value) {
  return compactCurrency.format(Number(value || 0));
}

export function formatNumber(value) {
  return number.format(Number(value || 0));
}

export function formatShortDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  }).format(date);
}

export function formatFullDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}
