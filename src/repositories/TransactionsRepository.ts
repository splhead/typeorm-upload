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
    const income = await this.createQueryBuilder('transaction')
      .select('SUM(value)', 'sum')
      .where('type = :type', { type: 'income' })
      .getRawOne();

    const outcome = await this.createQueryBuilder('transaction')
      .select('SUM(value)', 'sum')
      .where('type = :type', { type: 'outcome' })
      .getRawOne();

    return {
      income: parseFloat(income.sum),
      outcome: parseFloat(outcome.sum),
      total: income.sum - outcome.sum,
    };
  }
}

export default TransactionsRepository;
