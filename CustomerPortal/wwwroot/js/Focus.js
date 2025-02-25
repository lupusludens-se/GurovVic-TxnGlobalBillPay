window.jsfunction = {
    focusElement: function (id) { const element = document.getElementById(id); element.focus(); },
    clearElement: function (id) {
        const element = document.getElementById(id);
        element.value = element.value.replace(/[^0-9]/g, ''); 
    }
}

window.iFrameFunction = {
    sendMessage: function (message) {
        window.parent.postMessage(message, "*");
    }

}

window.getIPAddress = {

    getIP: function (key) {

        return fetch('https://api.ipdata.co/?' + key)
            .then((response) => response.json())
            .then((data) => {
                return data.ip
            })
    }
}

window.replace = {
    replaceLogo: function (url) {
        const element = document.getElementById("Logo");
        alert(element.src);
        element.src = url;
    }

}

window.blazorOpen = (args) => {
    window.open(args);
};