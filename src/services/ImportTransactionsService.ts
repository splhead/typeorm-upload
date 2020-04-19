import { getCustomRepository, getRepository, In } from 'typeorm';
import parse from 'csv-parse';
import fs from 'fs';

import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface FileEntry {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactions: FileEntry[] = [];
    const categories: string[] = [];
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    // read file
    const processFile = (): Promise<FileEntry[]> => {
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(parse({ trim: true, columns: true }))
          .on('data', transaction => {
            transactions.push(transaction);
            categories.push(transaction.category);
          })
          .on('error', err => {
            console.error(err);
            reject(err);
            throw new AppError(err.message);
          })
          .on('end', () => {
            console.log('CSV file successfully processed');
            resolve(transactions);
          });
      });
    };

    await processFile();

    // delete file
    const fileExists = await fs.promises.stat(filePath);

    if (fileExists) {
      await fs.promises.unlink(filePath);
    }

    const categoriesFound = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const categoriesFoundTitle = categoriesFound.map(
      category => category.title,
    );

    const categoriesTitlesToAdd = categories
      .filter(category => !categoriesFoundTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const createdCategories = categoryRepository.create(
      categoriesTitlesToAdd.map(title => ({ title })),
    );

    const finalCategories = [...createdCategories, ...categoriesFound];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.title,
        ),
      })),
    );

    await categoryRepository.save(createdCategories);

    await transactionsRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
