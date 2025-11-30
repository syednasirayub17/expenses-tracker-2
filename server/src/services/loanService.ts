interface EMICalculation {
    emi: number;
    totalInterest: number;
    totalPayment: number;
}

interface PrepaymentImpact {
    newEmi?: number;
    newTenure?: number;
    interestSaved: number;
    currentEmi: number;
    currentTenure: number;
}

interface AmortizationEntry {
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
}

class LoanService {
    /**
     * Calculate EMI using the formula:
     * EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
     */
    calculateEMI(principal: number, annualRate: number, tenureMonths: number): EMICalculation {
        const monthlyRate = annualRate / 12 / 100;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        const totalPayment = emi * tenureMonths;
        const totalInterest = totalPayment - principal;

        return {
            emi: Math.round(emi * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalPayment: Math.round(totalPayment * 100) / 100
        };
    }

    /**
     * Calculate prepayment impact
     */
    calculatePrepaymentImpact(
        principal: number,
        annualRate: number,
        tenureMonths: number,
        prepaymentAmount: number,
        option: 'reduce_emi' | 'reduce_tenure'
    ): PrepaymentImpact {
        const currentEMI = this.calculateEMI(principal, annualRate, tenureMonths);
        const newPrincipal = principal - prepaymentAmount;

        if (option === 'reduce_emi') {
            const newEMI = this.calculateEMI(newPrincipal, annualRate, tenureMonths);
            return {
                newEmi: newEMI.emi,
                currentEmi: currentEMI.emi,
                currentTenure: tenureMonths,
                interestSaved: currentEMI.totalInterest - newEMI.totalInterest
            };
        } else {
            // Calculate new tenure with same EMI
            const monthlyRate = annualRate / 12 / 100;
            const newTenure = Math.ceil(
                Math.log(currentEMI.emi / (currentEMI.emi - newPrincipal * monthlyRate)) /
                Math.log(1 + monthlyRate)
            );

            const newEMI = this.calculateEMI(newPrincipal, annualRate, newTenure);

            return {
                newTenure,
                currentEmi: currentEMI.emi,
                currentTenure: tenureMonths,
                interestSaved: currentEMI.totalInterest - newEMI.totalInterest
            };
        }
    }

    /**
     * Generate amortization schedule
     */
    generateAmortizationSchedule(
        principal: number,
        annualRate: number,
        tenureMonths: number
    ): AmortizationEntry[] {
        const { emi } = this.calculateEMI(principal, annualRate, tenureMonths);
        const monthlyRate = annualRate / 12 / 100;
        const schedule: AmortizationEntry[] = [];
        let balance = principal;

        for (let month = 1; month <= tenureMonths; month++) {
            const interest = balance * monthlyRate;
            const principalPaid = emi - interest;
            balance -= principalPaid;

            schedule.push({
                month,
                emi: Math.round(emi * 100) / 100,
                principal: Math.round(principalPaid * 100) / 100,
                interest: Math.round(interest * 100) / 100,
                balance: Math.max(0, Math.round(balance * 100) / 100)
            });
        }

        return schedule;
    }

    /**
     * Calculate next EMI date
     */
    getNextEMIDate(emiDay: number): Date {
        const now = new Date();
        const nextDate = new Date(now.getFullYear(), now.getMonth(), emiDay);

        if (nextDate <= now) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }

        return nextDate;
    }

    /**
     * Get upcoming EMIs in next N days
     */
    getUpcomingEMIs(loans: any[], days: number = 30): any[] {
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        return loans
            .map(loan => ({
                ...loan,
                nextEmiDate: this.getNextEMIDate(loan.emiDate)
            }))
            .filter(loan => loan.nextEmiDate <= futureDate)
            .sort((a, b) => a.nextEmiDate.getTime() - b.nextEmiDate.getTime());
    }
}

export default new LoanService();
