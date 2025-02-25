using System;

namespace CustomerPortal.Models.Reporting
{
    public class HistorySpanData
    {
        public int ID { get; set; }
        public string DisplayText { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public HistorySpanData()
        {
            ID = -2;
            DisplayText = "Last 6 Months";
            StartDate = DateTime.Now.AddMonths(-5);
            EndDate = DateTime.Now;
        }

        public HistorySpanData(int id, string displayText, DateTime startDate, DateTime endDate)
        {
            ID = id;
            DisplayText = displayText;
            StartDate = startDate;
            EndDate = endDate;
        }
    }
}
