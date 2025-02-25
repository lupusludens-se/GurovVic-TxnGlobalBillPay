namespace CustomerPortal.Models.Reporting
{
    public class CustomerDashboardData
    {
        public string Currency { get; set; } //key of dictionary
        public decimal totalAmountDueLast7Days { get; set; }
        public decimal totalAmountDueLast30Days { get; set; }
        public decimal totalAmountDueOver30Days { get; set; }
        public decimal totalAmountDue { get; set; }
        public int pendingTransactions7Days { get; set; }
        public int pendingTransactions30Days { get; set; }
        public int pendingTransactionsOver30Days { get; set; }
        public int totalPendingTransactions { get; set; }
    }
}
