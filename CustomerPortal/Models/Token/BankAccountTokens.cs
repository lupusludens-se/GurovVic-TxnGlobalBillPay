using System.Collections.Generic;

namespace CustomerPortal.Models.Token
{
    public class BankAccountTokens
    {
        public List<BankAccountToken> tokens { get; set; }
        public bool HasMoreResults { get; set; }
        public int Count { get; set; }
        public string ContinuationBankingToken { get; set; }
    }
}
