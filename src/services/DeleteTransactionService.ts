import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepositories = getRepository(Transaction);
    const transaction = await transactionsRepositories.findOne({
      select: ['id'],
      where: { id },
    });

    if (transaction) {
      await transactionsRepositories.delete(id);
    } else {
      throw new AppError('Transaction is not exists', 400);
    }
  }
}

export default DeleteTransactionService;
