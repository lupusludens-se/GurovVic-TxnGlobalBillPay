using CustomerPortal.Models.Token;
using Microsoft.AspNetCore.Components;
using MudBlazor;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Telerik.Blazor;
using Telerik.Blazor.Components;

namespace CustomerPortal.Pages.BankAccount
{
    public partial class BankAccountList
    {
        [Parameter]
        public string customerId { get; set; }
        public bool TokensHidden { get; set; }
        public bool ValidationHidden { get; set; }
        public List<BankAccountToken> BankAccountGridData { get; set; }
        public TelerikGrid<BankAccountToken> GridRef { get; set; }
        [CascadingParameter]
        public DialogFactory Dialogs { get; set; }

        /// <summary>
        /// Init Page
        /// </summary>
        protected override async Task OnInitializedAsync()
        {
            if (appService.AppCustomerId != null || customerId != null)
            {
                ValidationHidden = true;
            }
            else
            {
                TokensHidden = true;
            }

            if (Session.CustomerId != null)
            {
                await LoadBankTokens();
            }

            if (navigationHelper.CreatedBankToken) //CreatedBankToken will be set to true if being redirected from CreateBankToken page after creating bank token; display message and flip bool
            {
                snackbar.Add("Bank token created successfully.", Severity.Success);
                navigationHelper.CreatedBankToken = false;
            }
        }

        /// <summary>
        /// Load bank tokens
        /// </summary>
        private async Task LoadBankTokens()
        {
            var transactions = await tokenService.GetCustomerBankTokens(Session.CustomerId);

            if (transactions != null)
                BankAccountGridData = transactions.tokens;

            GridRef?.Rebind();
            StateHasChanged();
        }

        /// <summary>
        /// Navigate back to login page
        /// </summary>
        public void NavigateLogin()
        {
            var uri = $"{NavigationManager.BaseUri}Login/";
            var baseURI = new Uri(uri);
            NavigationManager.NavigateTo(baseURI.ToString(), true);
        }

        /// <summary>
        /// Delete bank token
        /// </summary>
        private async void DeleteBankToken(GridCommandEventArgs args)
        {
            if (args.Item is not BankAccountToken selectedToken)
            {
                throw new InvalidOperationException("GridCommandArgs not convertable to BankAccountToken.");
            }

            var item = args.Item as BankAccountToken;

            try
            {
                // Show dialog and use a bool to save its result
                var confirmDelete = await Dialogs.ConfirmAsync($"Are you sure you want to delete bank account " + item.DisplayAccountNumber + "?", "Confirm Deletion");
                
                if (!confirmDelete)
                {
                    // Cancel the delete if the user did not confirm
                    args.IsCancelled = true;
                }                
                else
                {
                    // Delete the item if the user confirms
                    var response = await tokenService.DeleteBankToken(Session.CustomerId, selectedToken.id);
                    if (response == null)
                    {
                        throw new InvalidOperationException("Response is null.");
                    }

                    if (response.isSuccess)
                    {
                        BankAccountGridData.Remove(selectedToken);
                        GridRef?.Rebind();
                        StateHasChanged();
                        snackbar.Add("Bank token deleted successfully.", Severity.Success);
                    }
                    else
                    {
                        snackbar.Add("Bank token could not be deleted", Severity.Warning);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting bank token: {ex}");
                snackbar.Add("There was an error deleting the bank token.", Severity.Error, config => { config.RequireInteraction = true; config.CloseAfterNavigation = true; });
            }
        }
    }
}
