using System.Collections.Generic;

namespace CustomerPortal.Models.BlueSnap.Token
{
    public class PaymentSources
    {
        public IEnumerable<SepaDirectDebitInfo> sepaDirectDebitInfo { get; set; }
        public IEnumerable<BecsDirectDebitInfo> becsDirectDebitInfo { get; set; }
    }
}
