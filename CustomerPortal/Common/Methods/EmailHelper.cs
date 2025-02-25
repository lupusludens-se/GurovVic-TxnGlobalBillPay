using CustomerPortal.Models.BlueSnap.Transaction;
using CustomerPortal.Models.Transaction;
using Microsoft.AspNetCore.Components;
using System.Collections.Generic;
using System.Text;

namespace CustomerPortal.Common.Methods
{
    /// <summary>
    /// Helper class for generating emails in HTML and plaintext format
    /// </summary>
    public class EmailHelper
    {
        private string URL { get; set; }
        private string LogoURL { get; set; }

        public EmailHelper(NavigationManager navigationManager)
        {
            URL = navigationManager.BaseUri;
            LogoURL = $"{navigationManager.BaseUri}/images/SchneiderLogo.jpg";
        }

        /// <summary>
        /// Generates email in HTML format with embedded logo and link
        /// </summary>
        public string GetHTMLEmail(string text)
        {
            return GetHTMLFromPlaintext(text) + GetEmbeddedImageHTML();
        }

        /// <summary>
        /// Generates plaintext message for completed bank transaction
        /// </summary>
        public string GetBankTransactionPlaintext(
            PendingTransaction pendingTransaction, 
            PaymentTransactionRequest paymentTransaction, 
            BankTransactionComplete completeTransaction,
            IEnumerable<PendingTransaction> transactionList
            )
        {
            var sb = new StringBuilder();

            if (completeTransaction.sepaDirectDebitTransaction == null)
            {
                sb.Append($"A payment in the amount of {pendingTransaction.currencySymbol}{paymentTransaction.amount.ToString("F")} has been processed.");
            }
            else
            {
                sb.Append($"{completeTransaction.sepaDirectDebitTransaction.preNotificationText}\n");
                sb.Append($"Mandate ReferenceID: {completeTransaction.sepaDirectDebitTransaction.mandateId}\n");
                sb.Append($"Mandate Acceptance Date: {completeTransaction.sepaDirectDebitTransaction.mandateDate}\n");
            }

            sb.Append("\n\nInvoice(s) to be processed:\n");
            foreach(var transaction in transactionList ) 
            {
                sb.Append($"Invoice ID: {transaction.orderId}\n");
                sb.Append($"Reference #: {transaction.customerRef}\n");
                sb.Append($"Invoice Amount: {transaction.currencySymbol}{transaction.amount.ToString("F")}\n");
                sb.Append('\n');
            }

            return sb.ToString();
        }

        /// <summary>
        /// Generates HTML message for completed bank transaction
        /// </summary>
        public string GetBankTransactionHTML(
            PendingTransaction pendingTransaction,
            PaymentTransactionRequest paymentTransaction,
            BankTransactionComplete completeTransaction,
            IEnumerable<PendingTransaction> transactionList
            )
        {
            var sb = new StringBuilder();
            sb.Append("<div>");
            sb.Append("<pre style=\"white-space: pre-wrap;\">");

            if (completeTransaction.sepaDirectDebitTransaction == null)
            {
                sb.Append($"<h3>A payment in the amount of {pendingTransaction.currencySymbol}{paymentTransaction.amount.ToString("F")} has been processed.</h3>");
            }
            else
            {
                sb.Append($"<h3>{completeTransaction.sepaDirectDebitTransaction.preNotificationText}</h3>");
                sb.Append("<p>");
                sb.Append($"<strong>Mandate ReferenceID:</strong> {completeTransaction.sepaDirectDebitTransaction.mandateId}\n");
                sb.Append($"<strong>Mandate Acceptance Date:</strong> {completeTransaction.sepaDirectDebitTransaction.mandateDate}\n");
                sb.Append("</p>");
            }

            sb.Append("<h4>Invoice(s) to be processed:</h4>");
            foreach (var transaction in transactionList)
            {
                sb.Append("<p>");
                sb.Append($"<strong>Invoice ID:</strong> {transaction.orderId}\n");
                sb.Append($"<strong>Reference #:</strong> {transaction.customerRef}\n");
                sb.Append($"<strong>Invoice Amount:</strong> {transaction.currencySymbol}{transaction.amount.ToString("F")}\n");
                sb.Append('\n');
                sb.Append("</p>");
            }
            sb.Append("</pre>");
            sb.Append("</div>");
            
            sb.Append(GetEmbeddedImageHTML());
            return sb.ToString();
        }

        /// <summary>
        /// Converts formatted plaintext string to html
        /// </summary>
        private static string GetHTMLFromPlaintext(string text)
        {
            return $"<div><pre style=\"white-space: pre-wrap;\">{text}</pre></div>";
        }

        /// <summary>
        /// Generates embedded image HTML
        /// </summary>
        private string GetEmbeddedImageHTML()
        {
            var sb = new StringBuilder();
            sb.Append("<div>");
            sb.Append($"<a href=\"{URL}\">");
            sb.Append($"<img src=\"{LogoURL}\" style = \"max-width: 300px; height: auto;\" />");
            sb.Append("</a>");
            sb.Append("</div>");

            return sb.ToString();
        }
    }
}
