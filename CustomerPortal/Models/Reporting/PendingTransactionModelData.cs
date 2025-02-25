using System.Collections.Generic;

namespace CustomerPortal.Models.Reporting
{
    public class PendingTransactionModelData
    {
        public Dictionary<string, CustomerDashboardData> CurrencyDict { get; set; } = new Dictionary<string, CustomerDashboardData>();
        public List<ModelData> ModelData { get; set; }
    }
}
