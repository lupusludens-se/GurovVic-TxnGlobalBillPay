import { postRequest } from "../shared/Client/Helpers";
import { TransactionBuilder } from "../shared/Builder/TransactionBuilder";
import { CommonTestResources } from "../shared/CommonTestResources";

export class InvoiceAPI {
  async generateInvoices() {
    const builder = new TransactionBuilder();
    this.resources = new CommonTestResources();
    const endpoint = this.resources.apiDetails.Transaction_start_endpoint;
    // Generate invoices with EUR
    for (let i = 0; i < 1; i++) {
      const requestPayload = builder
        .withMerchantId()
        .withProcessorId(9)
        .withOrderId()
        .withDescription()
        .withState()
        .withAmount()
        .withDueDate()
        .withCardHolderId(process.env.CARDHOLDER_ID)
        .withCurrency("EUR")
        .withCustomerRef()
        .withPdfLink()
        .withNotificationEmail()
        .withInvoiceAmount()
        .withVendorId("1206417")
        .withCountryRegionId("DE")
        .withInvoiceFile(this.resources.apiDetails.Invoice_file)
        .build();
      await postRequest(endpoint, requestPayload);
    }
    // Generate invoices with AUD
    for (let i = 0; i < 1; i++) {
      const requestPayload = builder
        .withMerchantId()
        .withProcessorId(9)
        .withOrderId()
        .withDescription()
        .withState()
        .withAmount()
        .withDueDate()
        .withCardHolderId(process.env.CARDHOLDER_ID)
        .withCurrency("AUD")
        .withCustomerRef()
        .withPdfLink()
        .withNotificationEmail()
        .withInvoiceAmount()
        .withVendorId("1207229")
        .withCountryRegionId("AU")
        .withInvoiceFile(this.resources.apiDetails.Invoice_file)
        .build();
      await postRequest(endpoint, requestPayload);
    }
  }
}
