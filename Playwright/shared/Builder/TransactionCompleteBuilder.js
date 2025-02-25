import { faker } from "@faker-js/faker";

export class TransactionBuilder {
  constructor(data = {}) {
    this.payload = {
      customerId:
        data.customerId !== undefined
          ? data.customerId
          : faker.number.int({ min: 10000, max: 100000000 }).toString(),
      merchantId:
        data.merchantId !== undefined
          ? data.merchantId
          : faker.number.int({ min: 10000, max: 100000000 }).toString(),
      transactionId:
        data.transactionId !== undefined
          ? data.transactionId
          : faker.number.int({ min: 10000, max: 100000000 }).toString(),
      processorId:
        data.processorId !== undefined
          ? data.processorId
          : faker.number.int({ min: 1, max: 20 }),
      orderId:
        data.orderId !== undefined
          ? data.orderId
          : faker.number.int({ min: 1000000, max: 9999999 }).toString(),
      description:
        data.description !== undefined
          ? data.description
          : faker.lorem.sentence(),
      state: data.state !== undefined ? data.state : faker.address.state(),
      amount:
        data.amount !== undefined
          ? data.amount
          : faker.number.int({ min: 1, max: 1000 }),
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate
          : faker.date.future().toISOString(),
      expirationHours:
        data.expirationHours !== undefined
          ? data.expirationHours
          : faker.number.int({ min: 1, max: 24 }),
      cardHolderId:
        data.cardHolderId !== undefined
          ? data.cardHolderId
          : faker.number.int(),
      currency:
        data.currency !== undefined
          ? data.currency
          : faker.finance.currencyCode(),
      customerRef:
        data.customerRef !== undefined
          ? data.customerRef
          : faker.number.int({ min: 100000, max: 999999 }).toString(),
      pdfLink: data.pdfLink !== undefined ? data.pdfLink : faker.internet.url(),
      notificationEmail:
        data.notificationEmail !== undefined
          ? data.notificationEmail
          : faker.internet.email(),
      invoiceAmount:
        data.invoiceAmount !== undefined
          ? data.invoiceAmount
          : faker.number.int({ min: 1, max: 1000 }),
      vendorId:
        data.vendorId !== undefined
          ? data.vendorId
          : faker.number.int({ min: 1000000, max: 9999999 }).toString(),
      countryRegionId:
        data.countryRegionId !== undefined
          ? data.countryRegionId
          : faker.location.countryCode(),
      invoiceFile:
        data.invoiceFile !== undefined
          ? data.invoiceFile
          : faker.system.fileName(),
    };
  }

  withCustomerId(customerId) {
    this.payload.customerId =
      customerId ?? faker.number.int({ min: 10000, max: 10000000 }).toString();
    return this;
  }

  withTransactionId(transactionId) {
    this.payload.transactionId =
      transactionId ??
      faker.number.int({ min: 10000, max: 10000000 }).toString();
    return this;
  }

  withMerchantId(merchantId) {
    this.payload.merchantId =
      merchantId ?? faker.number.int({ min: 10000, max: 10000000 }).toString();
    return this;
  }

  withProcessorId(processorId) {
    this.payload.processorId = processorId ?? 9;
    return this;
  }

  withOrderId(orderId) {
    this.payload.orderId =
      orderId ?? faker.number.int({ min: 10000, max: 10000000 }).toString();
    return this;
  }

  withDescription(description) {
    this.payload.description = description ?? faker.lorem.paragraph();
    return this;
  }

  withState(state) {
    this.payload.state = state ?? faker.location.state();
    return this;
  }

  withAmount(amount) {
    this.payload.amount = amount ?? faker.number.int({ min: 10, max: 100 });
    return this;
  }

  withDueDate(dueDate) {
    this.payload.dueDate = dueDate ?? faker.date.future().toISOString();
    return this;
  }

  withCardHolderId(cardHolderId) {
    this.payload.cardHolderId = cardHolderId ?? faker.string.alphanumeric();
    return this;
  }

  withCurrency(currency) {
    this.payload.currency =
      currency ?? faker.helpers.arrayElement(["EUR", "AUD"]);
    return this;
  }

  withCustomerRef(customerRef) {
    this.payload.customerRef = customerRef ?? faker.string.alphanumeric();
    return this;
  }

  withPdfLink(pdfLink) {
    this.payload.pdfLink = pdfLink ?? "";
    return this;
  }

  withNotificationEmail(notificationEmail) {
    this.payload.notificationEmail = notificationEmail ?? "";
    return this;
  }

  withInvoiceAmount(invoiceAmount) {
    this.payload.invoiceAmount =
      invoiceAmount ?? faker.number.int({ min: 10, max: 100 });
    return this;
  }

  withVendorId(vendorId) {
    this.payload.vendorId =
      vendorId ?? faker.number.int({ min: 10000, max: 1000000 }).toString();
    return this;
  }

  withCountryRegionId(countryRegionId) {
    this.payload.countryRegionId = countryRegionId ?? faker.location.country();
    return this;
  }

  withInvoiceFile(invoiceFile) {
    this.payload.invoiceFile = invoiceFile ?? "";
    return this;
  }

  build() {
    return JSON.stringify(this.payload);
  }
}
