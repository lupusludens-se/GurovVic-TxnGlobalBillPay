window.LocalCheckout = {
    initCheckout: async function (paymentMethodsResponse, clientKey,amount) {
        //const clientKey = document.getElementById("clientKey").innerHTML;
        var checkout = await createAdyenCheckout(paymentMethodsResponse, clientKey, amount);

        console.log(checkout.paymentMethodsResponse);
        const payment = document.getElementById("payment");
        checkout.create('card').mount(payment);

    }
}



async function createAdyenCheckout(session,clientKey,amount) {
    //alert(amount);
    return new AdyenCheckout(
        {
            
            clientKey,
            locale: "en_US",
            environment: "test",
            session: session,
            showPayButton: true,
            paymentMethodsConfiguration: {
                
                card: {
                    hasHolderName: true,
                    holderNameRequired: true,
                    name: "Credit card",
                    amount: {
                        value: amount,
                        currency: "USD",
                    },
                }
            },
            onPaymentCompleted: (result, component) => {
                console.info("onPaymentCompleted");
                console.info(result, component);
                handleServerResponse(result, component);
            },
            onError: (error, component) => {
                console.error("onError");
                console.error(error.name, error.message, error.stack, component);
                handleServerResponse(error, component);
            },
        }
    );
}



function filterUnimplemented(pm) {
    pm.paymentMethods = pm.paymentMethods.filter((it) =>
        [
            "ach",
            "scheme",
            "dotpay",
            "giropay",
            "ideal",
            "directEbanking",
            "klarna_paynow",
            "klarna",
            "klarna_account",
        ].includes("card")
    );
    return pm;
}

// Event handlers called when the shopper selects the pay button,
// or when additional information is required to complete the payment
async function handleSubmission(state, component, url) {
    try {
        const res = await callServer(url, state.data, window.location.href);
        handleServerResponse(res, component);
    } catch (error) {
        console.error(error);
        alert("Error occurred. Look at console for details");
    }
}

// Calls your server endpoints
async function callServer(url, data) {
    const res = await fetch(url, {
        method: "POST",
        body: data ? JSON.stringify(data) : "",
        headers: {
            "Content-Type": "application/json",
        },
    });

    return await res.json();
}

// Handles responses sent from your server to the client
function handleServerResponse(res, component) {
    if (res.action) {
        component.handleAction(res.action);
    } else {
        switch (res.resultCode) {
            case "Authorised":
                window.location.href = "/token/tokencomplete";
                break;
            case "Pending":
            case "Received":
                window.location.href = "/token/tokencomplete";
                break;
            case "Refused":
                window.location.href = "/token/tokenFailed/" + res.resultCode;
                break;
            default:
                window.location.href = "/token/tokenFailed/" + res.resultCode;
                break;
        }
    }
}

