using CustomerPortal.Models.Transaction;
using System;
using System.Collections.Generic;

namespace CustomerPortal.Models
{
    public class SessionState : IDisposable
    {
        public string Id { get; private set; }
        public string UserName { get; private set; }
        public string Email { get; set; }
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public bool IsAuthenticated { get; private set; }
        public string CustomerId { get; set; }
        public string NavigationPage { get; set; }
        public string IPAddress { get; set; }
        public string LogoURL { get; set; }
        public string StateImmunity { get; set; }
        public int LoadAmount { get; set; } = 20;
        public int PageSize { get; set; } = 20;
        public string MediaQuery { get; } = "(max-width: 767px)";
        public bool IsMobileLayout { get;set; }
        public string SharedCustomerId { get; set; }
        public string SignInCustomerId { get; set; }

        public List<PendingTransaction> SelectedTransactions { get; set; }

        public SessionState()
        {
            IsAuthenticated = false;
        }

        public void Authenticate(string email)
        {
            if (!IsAuthenticated)
            {
                Email = email;
                IsAuthenticated = true;
            }
        }

        public void Dispose()
        {
            Id = String.Empty;
            UserName = String.Empty;
            Email = String.Empty;
            FirstName = String.Empty;
            LastName = String.Empty;
            IsAuthenticated = false;
        }
    }
}
