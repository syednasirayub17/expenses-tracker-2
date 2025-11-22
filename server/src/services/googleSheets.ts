import { google } from 'googleapis';
import path from 'path';

interface SheetData {
    [key: string]: any;
}

class GoogleSheetsService {
    private sheets: any;
    private spreadsheetId: string;
    private auth: any;

    constructor() {
        this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
        this.initializeAuth();
    }

    private async initializeAuth() {
        try {
            const credentialsPath = path.join(__dirname, '../../credentials.json');
            const auth = new google.auth.GoogleAuth({
                keyFile: credentialsPath,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            this.auth = await auth.getClient();
            this.sheets = google.sheets({ version: 'v4', auth: this.auth });

            console.log('Google Sheets API initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google Sheets API:', error);
        }
    }

    async ensureSheetsInitialized() {
        if (!this.sheets) {
            await this.initializeAuth();
        }
    }

    async initializeSheetStructure() {
        await this.ensureSheetsInitialized();

        if (!this.spreadsheetId) {
            console.error('Google Sheets: Spreadsheet ID is not configured. Skipping initialization.');
            return;
        }

        const sheetTabs = [
            { name: 'Transactions', headers: ['ID', 'Date', 'Type', 'Category', 'Amount', 'Description', 'Account Type', 'Account ID'] },
            { name: 'Bank Accounts', headers: ['ID', 'Name', 'Account Number', 'Bank Name', 'Balance', 'Account Type', 'Created At'] },
            { name: 'Credit Cards', headers: ['ID', 'Name', 'Card Number', 'Bank Name', 'Limit', 'Current Balance', 'Available Credit', 'Due Date', 'Created At'] },
            { name: 'Loans', headers: ['ID', 'Name', 'Type', 'Principal Amount', 'Remaining Amount', 'Interest Rate', 'EMI Amount', 'EMI Date', 'Tenure Months', 'Remaining Months', 'Created At'] },
            { name: 'Budgets', headers: ['ID', 'Category', 'Amount', 'Period', 'Start Date', 'End Date'] },
            { name: 'Day Book', headers: ['ID', 'Date', 'Transaction IDs', 'Notes'] },
            { name: 'Journal', headers: ['ID', 'Title', 'Content', 'Tags', 'Date'] },
            { name: 'Stocks', headers: ['ID', 'Symbol', 'Name', 'Quantity', 'Average Price', 'Exchange', 'Updated At'] },
            { name: 'SIPs', headers: ['ID', 'Name', 'Amount', 'Start Date', 'Frequency', 'Is Active', 'Total Invested'] },
        ];

        try {
            // Get existing sheets
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });

            const existingSheets = response.data.sheets?.map((sheet: any) => sheet.properties.title) || [];

            // Create missing sheets
            for (const tab of sheetTabs) {
                if (!existingSheets.includes(tab.name)) {
                    await this.createSheet(tab.name, tab.headers);
                }
            }

            console.log('Sheet structure initialized');
        } catch (error) {
            console.error('Error initializing sheet structure:', error);
        }
    }

    private async createSheet(sheetName: string, headers: string[]) {
        try {
            // Add new sheet
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: sheetName,
                                },
                            },
                        },
                    ],
                },
            });

            // Add headers
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [headers],
                },
            });

            console.log(`Created sheet: ${sheetName}`);
        } catch (error) {
            console.error(`Error creating sheet ${sheetName}:`, error);
        }
    }

    async appendRow(sheetName: string, data: any[]) {
        await this.ensureSheetsInitialized();

        try {
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A:A`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [data],
                },
            });
        } catch (error) {
            console.error(`Error appending to ${sheetName}:`, error);
        }
    }

    async updateRow(sheetName: string, rowNumber: number, data: any[]) {
        await this.ensureSheetsInitialized();

        try {
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A${rowNumber}`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [data],
                },
            });
        } catch (error) {
            console.error(`Error updating ${sheetName} row ${rowNumber}:`, error);
        }
    }

    async findRowByID(sheetName: string, id: string): Promise<number | null> {
        await this.ensureSheetsInitialized();

        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A:A`,
            });

            const rows = response.data.values || [];
            const rowIndex = rows.findIndex((row: any[]) => row[0] === id);

            return rowIndex >= 0 ? rowIndex + 1 : null;
        } catch (error) {
            console.error(`Error finding row in ${sheetName}:`, error);
            return null;
        }
    }

    // Sync methods for different data types
    async syncTransaction(transaction: any) {
        const data = [
            transaction.id || transaction._id,
            transaction.date,
            transaction.type,
            transaction.category,
            transaction.amount,
            transaction.description || '',
            transaction.accountType || '',
            transaction.accountId || '',
        ];

        const existingRow = await this.findRowByID('Transactions', data[0]);
        if (existingRow) {
            await this.updateRow('Transactions', existingRow, data);
        } else {
            await this.appendRow('Transactions', data);
        }
    }

    async syncBankAccount(account: any) {
        const data = [
            account.id || account._id,
            account.name,
            account.accountNumber,
            account.bankName,
            account.balance,
            account.accountType,
            account.createdAt,
        ];

        const existingRow = await this.findRowByID('Bank Accounts', data[0]);
        if (existingRow) {
            await this.updateRow('Bank Accounts', existingRow, data);
        } else {
            await this.appendRow('Bank Accounts', data);
        }
    }

    async syncCreditCard(card: any) {
        const data = [
            card.id || card._id,
            card.name,
            card.cardNumber,
            card.bankName,
            card.limit,
            card.currentBalance,
            card.availableCredit,
            card.dueDate,
            card.createdAt,
        ];

        const existingRow = await this.findRowByID('Credit Cards', data[0]);
        if (existingRow) {
            await this.updateRow('Credit Cards', existingRow, data);
        } else {
            await this.appendRow('Credit Cards', data);
        }
    }

    async syncLoan(loan: any) {
        const data = [
            loan.id || loan._id,
            loan.name,
            loan.loanType,
            loan.principalAmount,
            loan.remainingAmount,
            loan.interestRate,
            loan.emiAmount,
            loan.emiDate,
            loan.tenureMonths,
            loan.remainingMonths,
            loan.createdAt,
        ];

        const existingRow = await this.findRowByID('Loans', data[0]);
        if (existingRow) {
            await this.updateRow('Loans', existingRow, data);
        } else {
            await this.appendRow('Loans', data);
        }
    }

    async syncBudget(budget: any) {
        const data = [
            budget.id || budget._id,
            budget.category,
            budget.amount,
            budget.period,
            budget.startDate,
            budget.endDate || '',
        ];

        const existingRow = await this.findRowByID('Budgets', data[0]);
        if (existingRow) {
            await this.updateRow('Budgets', existingRow, data);
        } else {
            await this.appendRow('Budgets', data);
        }
    }

    async syncDayBook(entry: any) {
        const data = [
            entry.id || entry._id,
            entry.date,
            Array.isArray(entry.transactionIds) ? entry.transactionIds.join(', ') : entry.transactionIds || '',
            entry.notes || '',
        ];

        const existingRow = await this.findRowByID('Day Book', data[0]);
        if (existingRow) {
            await this.updateRow('Day Book', existingRow, data);
        } else {
            await this.appendRow('Day Book', data);
        }
    }

    async syncJournal(entry: any) {
        const data = [
            entry.id || entry._id,
            entry.title,
            entry.content,
            Array.isArray(entry.tags) ? entry.tags.join(', ') : entry.tags || '',
            entry.date,
        ];

        const existingRow = await this.findRowByID('Journal', data[0]);
        if (existingRow) {
            await this.updateRow('Journal', existingRow, data);
        } else {
            await this.appendRow('Journal', data);
        }
    }

    async syncStock(stock: any) {
        const data = [
            stock.id || stock._id,
            stock.symbol,
            stock.name || '',
            stock.quantity,
            stock.averagePrice,
            stock.exchange || '',
            stock.updatedAt || new Date().toISOString(),
        ];

        const existingRow = await this.findRowByID('Stocks', data[0]);
        if (existingRow) {
            await this.updateRow('Stocks', existingRow, data);
        } else {
            await this.appendRow('Stocks', data);
        }
    }

    async syncSIP(sip: any) {
        const data = [
            sip.id || sip._id,
            sip.name,
            sip.amount,
            sip.startDate,
            sip.frequency,
            sip.isActive,
            sip.totalInvested || 0,
        ];

        const existingRow = await this.findRowByID('SIPs', data[0]);
        if (existingRow) {
            await this.updateRow('SIPs', existingRow, data);
        } else {
            await this.appendRow('SIPs', data);
        }
    }
}

export default new GoogleSheetsService();
