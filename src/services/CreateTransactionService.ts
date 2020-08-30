import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    let category = await categoriesRepository.findOne({
      where: { title: categoryTitle },
    });

    if (!category) {
      category = categoriesRepository.create({
        title: categoryTitle,
      });

      await categoriesRepository.save(category);
    }

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError(
        'Type is not valid, expected is "income" or "outcome"',
        400,
      );
    }

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (value > balance.total) {
        throw new AppError('Insufficient funds', 400);
      }
    }

    const trasaction = transactionsRepository.create({
      category_id: category.id,
      title,
      value,
      type,
    });

    await transactionsRepository.save(trasaction);

    return trasaction;
  }
}

export default CreateTransactionService;
