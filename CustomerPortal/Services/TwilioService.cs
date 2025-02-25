using CustomerPortal.Common.Enums;
using CustomerPortal.Common.Settings;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using Twilio;
using Twilio.Exceptions;
using Twilio.Rest.Verify.V2.Service;

namespace CustomerPortal.Services
{
    public class TwilioService
    {
        const int MAX_RETRIES_REACHED_ERROR_CODE = 60202;

        private IApplicationSettings AppSettings { get; }
        private HttpClient HttpClient { get; }

        public TwilioService(IApplicationSettings appSettings, IHttpClientFactory httpClientFactory)
        {
            AppSettings = appSettings;
            HttpClient = httpClientFactory.CreateClient();
            HttpClient.DefaultRequestHeaders.Add(AppSettings.GlobalBillPayService.ApiKeyName, AppSettings.GlobalBillPayService.ApiKeyValue);
        }

        public bool SendCode(
            string phone,
            string email,
            string contactType
            )
        {
            var verifyPhoneType = TwilioVerificationType.sms;

            switch (contactType)
            {
                case "TEXT":
                    verifyPhoneType = TwilioVerificationType.sms;
                    break;
                case "EMAIL":
                    verifyPhoneType = TwilioVerificationType.email;
                    break;
                case "CALL":
                    verifyPhoneType = TwilioVerificationType.call;
                    break;
                default:
                    //--> Something wrong.
                    break;

            }

            var accountSid = AppSettings.Twilio.AccountSid;
            var authToken = AppSettings.Twilio.AuthToken;

            TwilioClient.Init(accountSid, authToken);
            try
            {
                switch (verifyPhoneType)
                {
                    case TwilioVerificationType.sms:
                        VerificationResource.Create(
                            to: phone,
                            channel: "sms",
                            pathServiceSid: AppSettings.Twilio.VerificationSid
                            );
                        break;
                    case TwilioVerificationType.email:
                        VerificationResource.Create(
                            to: email,
                            channel: "email",
                            pathServiceSid: AppSettings.Twilio.VerificationSid
                            );
                        break;
                    case TwilioVerificationType.call:
                        VerificationResource.Create(
                            to: phone,
                            channel: "call",
                            pathServiceSid: AppSettings.Twilio.VerificationSid
                            );
                        break;
                    default:
                        return false;

                }
            }
            catch (Exception exc)
            {
                try
                {
                    Console.WriteLine(exc.Message);
                    return false;
                }
                catch (Exception)
                {
                    Console.WriteLine("There was an error, but there was no InnerException, likely an issue sending too many requests to Twilio.");
                    return false;
                }
            }

            return true;
        }

        public async Task<string> VerifyCode(
            string phone,
            string email,
            string contactType,
            string code
            )
        {
            var accountSid = AppSettings.Twilio.AccountSid;
            var authToken = AppSettings.Twilio.AuthToken;
            var verifyPhoneType = TwilioVerificationType.sms;
            switch (contactType)
            {
                case "TEXT":
                    verifyPhoneType = TwilioVerificationType.sms;
                    break;
                case "EMAIL":
                    verifyPhoneType = TwilioVerificationType.email;
                    break;
                case "CALL":
                    verifyPhoneType = TwilioVerificationType.call;
                    break;
                default:
                    //--> Something wrong.
                    break;
            }

            TwilioClient.Init(accountSid, authToken);

            var to = verifyPhoneType == TwilioVerificationType.sms
                ? phone
                : email;

            try
            {
                var verification = await VerificationCheckResource.CreateAsync(
                    to: to,
                    code: code,
                    pathServiceSid: AppSettings.Twilio.VerificationSid
                    );

                return verification.Status;
            }
            catch (ApiException twilioException)
            {
                Console.WriteLine(twilioException.Message);
                return twilioException.Code == MAX_RETRIES_REACHED_ERROR_CODE ? "Locked" : "Error";
            }
            catch (Exception ex) 
            {
                Console.WriteLine(ex.Message);
                return "Error";
            }
        }
    }
}
