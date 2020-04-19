import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  return response.json({
    transactions: await transactionsRepository.find({
      relations: ['category'],
    }),
    balance: await transactionsRepository.getBalance(),
  });
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const createTransaction = new CreateTransactionService();
    const transaction = await createTransaction.execute(request.body);
    return response.json(transaction);
  } catch (err) {
    return response
      .status(err.statusCode)
      .json({ message: err.message, status: 'error' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const deleteTransaction = new DeleteTransactionService();
    await deleteTransaction.execute(id);
    return response.status(204).send();
  } catch (err) {
    return response.status(err.statusCode).json({ error: err.message });
  }
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
