import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);

    const transactionsCSV: Array<string[]> = [];

    parseCSV.on('data', line => {
      transactionsCSV.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions: Transaction[] = [];

    for (let i = 0; i < transactionsCSV.length; i++) {
      const [title, type, value, category] = transactionsCSV[i];

      const transaction = await createTransaction.execute({
        title,
        type: type as 'income' | 'outcome',
        value: Number(value),
        categoryTitle: category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
