import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const { income, outcome } = await this.createQueryBuilder('transactions')
      .select(
        "SUM(CASE WHEN type LIKE 'income' THEN value ELSE 0 END)",
        'income',
      )
      .addSelect(
        "SUM(CASE WHEN type LIKE 'outcome' THEN value ELSE 0 END)",
        'outcome',
      )
      .getRawOne();

    const total = parseInt(income, 10) - parseInt(outcome, 10);

    return {
      income: parseInt(income, 10),
      outcome: parseInt(outcome, 10),
      total,
    };
  }
}

export default TransactionsRepository;
