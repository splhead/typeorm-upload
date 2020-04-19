import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const categoryFound = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    const category_id = categoryFound
      ? categoryFound.id
      : await categoryRepository
          .save(categoryRepository.create({ title: category }))
          .then(cat => cat.id);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError("You don't have enough money");
    }

    const transactionSaved = await transactionRepository.save(
      transactionRepository.create({
        title,
        value,
        type,
        category_id,
      }),
    );

    return transactionSaved;
  }
}

export default CreateTransactionService;
