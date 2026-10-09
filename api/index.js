import { paymentsApp } from '../server/payments.js';

export default function handler(req, res) {
  return paymentsApp(req, res);
}
