using System.Collections.Generic;

namespace CustomerPortal.Models.Reporting
{
    public class GetCustomerDashboardResponse
    {
        public Dictionary<string, CustomerDashboardData> DashboardData { get; set; } = new Dictionary<string, CustomerDashboardData>();
        public int Last7DaysCount { get; set; }
        public int Last30DaysCount { get; set; }
        public int Over30DaysCount { get; set; }
    }
}
