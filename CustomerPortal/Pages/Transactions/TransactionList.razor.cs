using CustomerPortal.Common.Enums;
using CustomerPortal.Common.Methods;
using CustomerPortal.Models.BlueSnap.Transaction;
using CustomerPortal.Models.Communication;
using CustomerPortal.Models.Customer;
using CustomerPortal.Models.Token;
using CustomerPortal.Models.Transaction;
using CustomerPortal.Services;
using Microsoft.AspNetCore.Components;
using MudBlazor;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Telerik.Blazor;
using Telerik.Blazor.Components;
using Telerik.DataSource;

namespace CustomerPortal.Pages.Transactions
{
    public partial class TransactionList
    {
        // Bank Data
        private BankAccountToken SelectedBankAccount { get; set; }
        private List<BankAccountToken> BankTokensList { get; set; }
        private TelerikGrid<BankAccountToken> BankGridRef { get; set; }

        private decimal TotalAmount { get; set; }
        private string FormattedValue { get; set; }

        // Payment control button
        private bool PaymentStarted { get; set; }
        private bool ButtonDisabled { get; set; }
        private bool TransactionsHidden { get; set; }
        private string SubmitButtonEnabledClass { get; set; }

        // Transaction data
        private List<PendingTransaction> TransactionGridData { get; set; }
        private IEnumerable<PendingTransaction> SelectedTransactions { get; set; } = Enumerable.Empty<PendingTransaction>();
        private int QueryCount { get; set; } = 20;
        private List<CustomerCategoryFilterEntity> CustomerFilterList { get; set; }
        private List<string> CustomerFilter { get; set; } = new List<string>();
        private string FilterCategory { get; set; }
        private TelerikGrid<PendingTransaction> GridRef { get; set; }
        CultureInfo CultureInfo { get; set; }

        // Mobile Layout
        private bool ModalVisible { get; set; }
        private PendingTransaction MobileViewTransaction { get; set; }

        //Mandate
        public bool TermsAccepted { get; set; }

        [CascadingParameter]
        public DialogFactory Dialogs { get; set; }

        #region Initialization

        /// <summary>
        /// Page initialization
        /// </summary>
        protected override async Task OnInitializedAsync()
        {
            if (Session.CustomerId != null)
            {
                var customer = await CustomerService.GetCustomerEmailAsync(Session.Email);
                CustomerFilterList = customer.filterCategoryList;

                foreach (var filter in CustomerFilterList)
                {
                    FilterCategory = filter.filterCategory;
                    CustomerFilter.Add(filter.value);
                };

                if (customer.id != null)
                {
                    TransactionsHidden = false;
                }

                Session.CustomerId = string.IsNullOrWhiteSpace(customer.sharedCustomerId) ? customer.id : customer.sharedCustomerId;
            }
            else
            {
                if (Session.IsAuthenticated == false)
                {
                    NavigateLogin();
                    return;
                }

                TransactionsHidden = true;
                if (Session.Email == null)
                {
                    var customer = await CustomerService.GetCustomerEmailAsync(Session.Email);
                    Session.CustomerId = customer.sharedCustomerId ?? customer.id;
                }
            }

            // Reset selected transactions
            Session.SelectedTransactions = null;

            // Allow Culture formatting
            CultureInfo = null;

            // submit transactions disabled
            SetButtonSubmitDisabled();

            QueryCount = Session.LoadAmount;

            if (Session.CustomerId != null)
            {
                await LoadDataTransactions();
                await LoadBankTokens();
            }

            StateHasChanged();
        }

        /// <summary>
        /// State initialization
        /// </summary>
        static void OnStateInitHandler(GridStateEventArgs<PendingTransaction> args)
        {
            var state = new Telerik.Blazor.Components.GridState<PendingTransaction>
            {
                SortDescriptors = new List<SortDescriptor>
                {
                    new() { Member = "orderId", SortDirection = ListSortDirection.Ascending }
                }
            };

            args.GridState = state;
        }

        #endregion

        #region Submit Payment

        /// <summary>
        /// Submit payments entrypoint
        /// Does common validation and enables/disables the submit button
        /// </summary>
        private async Task Submit()
        {
            if (PaymentStarted)
            {
                snackbar.Add($"A payment has already been started. Please wait for a response", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                return;
            }

            if (!SelectedTransactions.Any())
            {
                snackbar.Add($"Select a transaction to pay", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                return;
            }

            if (SelectedBankAccount == null)
            {
                snackbar.Add("Please select an account to continue");
                return;
            }

            if (SelectedBankAccount.iBan != null)
            {
                TermsAccepted = false;
                await ShowSEPAMandate();

                if (!TermsAccepted)
                {
                    snackbar.Add($"The SEPA Direct Debit Mandate aggrement must be confirmed before processing an invoice.", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                    return;
                }
            }
            else
            {
                await Task.Delay(1); //force UI reload if we don't await SEPA agreement above
            }

            DisablePaymentSubmission();

            await SubmitBankPayment();

            EnablePaymentSubmission();
        }

        /// <summary>
        /// Submit bank payment
        /// </summary>
        private async Task SubmitBankPayment()
        {
            // Retrieve transaction by invoice/order id and see if it's complete
            var transaction = SelectedTransactions.First();
            var completedTransaction = await TransactionService.GetCompletedTransactionAsync(transaction.id);
            if (completedTransaction.orderId != null && completedTransaction.CreatedDate == DateTime.Today)
            {
                snackbar.Add($"The order/invoice {transaction.orderId} has already been processed previously. This message is for your protection. See your administrator", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                return;
            }

            // Gather vendor information for each selected invoice in this transaction
            var vendorsInfo = new Dictionary<string, Models.Transaction.VendorInfo>();
            foreach (var txn in SelectedTransactions)
            {
                if (string.IsNullOrWhiteSpace(txn.vendorId))
                {
                    snackbar.Add("Vendor information has not been provided for this invoice. Contact your administrator.", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                    return;
                }
                
                var vendorInfo = new Models.Transaction.VendorInfo
                {
                    VendorID = txn.vendorId,
                    Amount = txn.amount,
                };

                if (vendorsInfo.ContainsKey(vendorInfo.VendorID))
                {
                    vendorsInfo[vendorInfo.VendorID].Amount += txn.amount;
                }
                else
                {
                    vendorsInfo.Add(vendorInfo.VendorID, vendorInfo);
                }
            }

            var bankAccountTransaction = new BankAccountTransaction
            {
                amount = Convert.ToDecimal(TotalAmount),
                paymentProfileId = SelectedBankAccount.paymentProfileId,
                transactionId = transaction.id,
                processorId = transaction.processorId,
                customerId = Session.CustomerId,
                bankAccountType = SelectedBankAccount.bankAccountType,
                accountType = Enum.Parse<AccountType>(SelectedBankAccount.accountType),
                routingNumber = SelectedBankAccount.routingNumber,
                account = SelectedBankAccount.accountNumber,
                iBan = SelectedBankAccount.iBan,
                currency = transaction.currency,
                accountName = SelectedBankAccount.customerName,
                customerRef = transaction.customerRef,
                bsbNumber = SelectedBankAccount.bsbNumber,
                agreementId = SelectedBankAccount.agreementId,
                VendorsInfo = vendorsInfo.Values,
            };

            var complete = await TransactionService.processBankNoComplete(bankAccountTransaction);
            if (!complete.isSuccess)
            {
                snackbar.Add("A problem occurred. Please check that your payment information is correct.", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                return;
            }

            var paymentTransaction = new PaymentTransactionRequest
            {
                amount = Convert.ToDecimal(TotalAmount),
                accountNumber = SelectedBankAccount.DisplayAccountNumber,
                currency = transaction.currency,
                merchantId = bankAccountTransaction.merchantId,
                paymentMethod = PaymentMethod.Bank,
                paymentStatus = PaymentStatus.Complete,
                settledTransactionId = transaction.id,
                cardHolderId = bankAccountTransaction.customerId,
                percent = 0.0M
            };

            var paymentResponse = await TransactionService.postPayment(paymentTransaction);
            if (paymentResponse.isSuccess && !string.IsNullOrWhiteSpace(Session.Email))
            {
                var emailRequest = new CommunicationEmailRequest
                {
                    message = EmailHelper.GetBankTransactionPlaintext(transaction, paymentTransaction, complete, SelectedTransactions),
                    htmlMessage = EmailHelper.GetBankTransactionHTML(transaction, paymentTransaction, complete, SelectedTransactions),
                    subject = "Schneider Electric: A payment has been received",
                    toEmail = Session.Email,
                    toName = Session.Email
                };

                await CommunicationService.CreateCommunicationEmail(emailRequest);
            }

            if (paymentResponse.isSuccess)
            {
                foreach (var pending in SelectedTransactions)
                {
                    var transactionComplete = new BankTransactionComplete
                    {
                        customerId = Session.CustomerId,
                        transactionId = pending.id,
                        completionMethod = CompletionMethod.Bank,
                        paymentStatus = PaymentStatus.Success,
                        customerRef = pending.customerRef,
                        bankAccount = SelectedBankAccount.accountNumber,
                        paymentId = paymentResponse.paymentTransaction.id,
                        currency = transaction.currency,
                        processorReferenceId = complete.processorReferenceId,
                        processorTransactionId = complete.processorTransactionId
                    };

                    var transactionResponse = await TransactionService.CompleteTransaction(transactionComplete);
                    if (!transactionResponse.isSuccess)
                    {
                        snackbar.Add("A problem occured. Transaction was processed but invoices were not completed.", Severity.Warning);

                        if (transaction.notificationEmail == null)
                        {
                            continue;
                        }

                        var failEmailRequest = new CommunicationEmailRequest
                        {
                            message = $"Order/Invoice {pending.orderId} has failed with message {transactionResponse.message}",
                            subject = $"Payment has failed for {pending.orderId}",
                            toEmail = pending.notificationEmail,
                            toName = pending.notificationEmail
                        };

                        await CommunicationService.CreateCommunicationEmail(failEmailRequest);
                        break;
                    }

                    if (transaction.notificationEmail == null)
                    {
                        continue;
                    }

                    var successEmailRequest = new CommunicationEmailRequest
                    {
                        message = $"Order/Invoice {pending.orderId} has been processed in the amount of {pending.amount.ToString()} by way of {complete.paymentMethod}",
                        subject = $"Payment has been made for {pending.orderId}",
                        toEmail = pending.notificationEmail,
                        toName = pending.notificationEmail
                    };

                    await CommunicationService.CreateCommunicationEmail(successEmailRequest);
                }
            }

            snackbar.Add("Your transaction has processed successfully", Severity.Success);
            NavigateComplete();
        }

        /// <summary>
        /// Update elements when a payment is not in submission
        /// </summary>
        private void EnablePaymentSubmission()
        {
            PaymentStarted = false;
            SetButtonSubmitEnabled();
        }

        /// <summary>
        /// Update elements when a payment is submitted
        /// </summary>
        private void DisablePaymentSubmission()
        {
            PaymentStarted = true;
            SetButtonSubmitDisabled();
        }

        /// <summary>
        /// Disable submission button
        /// </summary>
        private void SetButtonSubmitDisabled()
        {
            ButtonDisabled = true;
            SubmitButtonEnabledClass = "ml-3 flex justify-right py-2 px-4 btn btn-light";
            StateHasChanged();
        }

        /// <summary>
        /// Enable submission Button
        /// </summary>
        private void SetButtonSubmitEnabled()
        {
            ButtonDisabled = false;
            SubmitButtonEnabledClass = "ml-3 flex justify-right py-2 px-4 btn btn-primary";
            StateHasChanged();
        }

        #endregion

        #region Mandate

        public async Task ShowSEPAMandate()
        {
            var response = await TokenService.GetMandate(Common.Constants.PaymentProcessor.BlueSnap, AccountType.SEPA);
            TermsAccepted = await Dialogs.ConfirmAsync($"{response.AgreementText}", "SEPA Direct Debit Mandate");
            StateHasChanged();
        }

        #endregion

        #region Selection

        /// <summary>
        /// OnSelect event handler
        /// </summary>
        private void OnSelect(IEnumerable<PendingTransaction> transactions)
        {
            SelectedTransactions = transactions;

            CultureInfo = CultureInfoUtils.GetCultureInfo(SelectedTransactions.FirstOrDefault()?.currency);

            if (SelectedTransactions.Any() && SelectedBankAccount != null)
            {
                SetButtonSubmitEnabled();
            }
            else
            {
                SetButtonSubmitDisabled();
            }

            CalculateSelectedTransactions();
        }

        /// <summary>
        /// Render handler for pending transaction grid
        /// </summary>
        private void OnRowRenderHandler(GridRowRenderEventArgs args)
        {
            var item = args.Item as PendingTransaction;

            // Applying a custom class conditionally.
            if ((SelectedTransactions.Any() && item.currency != SelectedTransactions.First().currency) 
                || SelectedBankAccount != null && item.currency != SelectedBankAccount.currency)
            {
                args.Class = "unselectable-row";
            }
        }

        /// <summary>
        /// Render handler for bank accounts grid
        /// </summary>
        private void OnBankRowRenderHandler(GridRowRenderEventArgs args)
        {
            var item = args.Item as BankAccountToken;

            // Applying a custom class conditionally.
            if (SelectedTransactions.Any() && item.currency != SelectedTransactions.First().currency)
            {
                args.Class = "unselectable-row";
            }
        }

        /// <summary>
        /// Calculate total for selected transaction(s)
        /// </summary>
        private void CalculateSelectedTransactions()
        {
            decimal sumAmount = 0;
            decimal eligibleAmount = 0;

            if (!string.IsNullOrWhiteSpace(Session.StateImmunity))
            {
                var states = Session.StateImmunity.Split(';').ToHashSet();
                foreach (var pendingTransaction in SelectedTransactions)
                {
                    sumAmount += pendingTransaction.amount;

                    if (pendingTransaction.state == null || !states.Contains(pendingTransaction.state))
                    {
                        eligibleAmount += pendingTransaction.amount;
                    }
                }
            }
            else
            {
                foreach (var pendingTransaction in SelectedTransactions)
                {
                    sumAmount += pendingTransaction.amount;
                    eligibleAmount += pendingTransaction.amount;
                }
            }

            TotalAmount = sumAmount;
            //account can only have one currency type.
            FormattedValue = TotalAmount.ToString("C", CultureInfo);

            StateHasChanged();
        }


        /// <summary>
        /// OnSelectBankAccount event handler
        /// </summary>
        private void OnSelectBankAccount(IEnumerable<BankAccountToken> bankAccountToken)
        {
            SelectedBankAccount = bankAccountToken.FirstOrDefault();

            if (SelectedTransactions.Any() && SelectedBankAccount != null)
            {
                SetButtonSubmitEnabled();
            }
            else
            {
                SetButtonSubmitDisabled();
            }

            StateHasChanged();
        }

        #endregion

        #region Load

        /// <summary>
        /// Load transaction data
        /// </summary>
        private async Task LoadDataTransactions()
        {
            var transactions = await TransactionService.GetCustomerTransactions(Session.CustomerId, QueryCount);
            var pendingTransactions = transactions.Transactions;

            if (CustomerFilter.Any())
            {
                if (FilterCategory != "CountryRegionId")
                {
                    snackbar.Add("A problem occured. Category Filter is not recognized", Severity.Warning);
                }
                else
                {
                    var filteredTransactions = pendingTransactions.Where(trans => CustomerFilter.Contains(trans.countryRegionId)).ToList();

                    try
                    {
                        if (filteredTransactions.Any())
                        {
                            TransactionGridData = filteredTransactions;
                            GridRef?.Rebind();
                            StateHasChanged();
                            return;
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"An exception occuring loading transanctions: {ex.Message}");
                        snackbar.Add("A problem occured.", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
                    }
                }
            }

            if (transactions.Transactions != null)
            {
                TransactionGridData = transactions.Transactions;
            }

            CultureInfoUtils.FormatMonetaryValuesToShowCorrectSymbols(0)(TransactionGridData);
            GridRef?.Rebind();
            StateHasChanged();
        }

        /// <summary>
        /// Load bank tokens
        /// </summary>
        private async Task LoadBankTokens()
        {
            var bankTokens = await TokenService.GetCustomerBankTokens(Session.CustomerId);
            BankTokensList = bankTokens.tokens;
            StateHasChanged();
        }

        #endregion

        #region Utilities

        /// <summary>
        /// Navigate to login page
        /// </summary>
        private void NavigateLogin()
        {
            Session.NavigationPage = NavigationManager.Uri;
            var uri = $"{NavigationManager.BaseUri}Login/";
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), true);
        }

        /// <summary>
        /// Navigate to payment complete page
        /// </summary>
        private void NavigateComplete()
        {
            var baseURI = $"{new Uri(NavigationManager.BaseUri)}transaction/TransactionComplete";
            NavigationManager.NavigateTo(baseURI);
        }

        /// <summary>
        /// Amount field right justified
        /// </summary>
        private static void RightJustifyCell(GridCellRenderEventArgs e)
        {
            e.Class = "right-align";
        }

        /// <summary>
        /// Enable transaction view modal
        /// </summary>
        private void ViewTransaction(GridCommandEventArgs args)
        {
            MobileViewTransaction = args.Item as PendingTransaction;
            ModalVisible = true;
        }

        /// <summary>
        /// Toggle modal
        /// </summary>
        private void ToggleModal()
        {
            ModalVisible = !ModalVisible;
        }

        #endregion
    }
}
