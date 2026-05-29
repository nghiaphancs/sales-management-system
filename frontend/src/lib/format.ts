export function formatMoney(amount: number | string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleString('vi-VN');
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  DELIVERED: 'Đã giao',
  CANCELED: 'Đã hủy',
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  UNPAID: 'Chưa thanh toán',
  PARTIAL: 'Thanh toán một phần',
  PAID: 'Đã thanh toán',
};
