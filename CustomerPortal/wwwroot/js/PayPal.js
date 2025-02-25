function RenderPaypalButton(elementId, locAmount, onApproveFunctionAssembly, onApproveFunctionName, transactionId) {
    amount = locAmount;
    paypal.Buttons({
        style: {
            layout: 'horizontal',
            color: 'blue',
            shape: 'pill',
            tagline: 'false',
            height: 35
        },
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: amount
                    }
                }]

            });
        },
        onApprove: function (data, actions) {
            DotNet.invokeMethodAsync(onApproveFunctionAssembly, onApproveFunctionName, data, actions, transactionId);
            window.parent.postMessage("Complete", "*");
            window.location.href = transactionId;
        }
    }).render(elementId);
}