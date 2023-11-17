﻿//Create a WebSocket to perform duplex (back-and-forth) communication with server
const token = document.querySelector("#FinnhubToken").value;
const socket = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
var stockSymbol = document.getElementById("StockSymbol").value; //get symbol from input hidden
var counter = 0;

// Connection opened. Subscribe to a symbol
socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': stockSymbol }))
});

// Listen (ready to receive) for messages
socket.addEventListener("message", function (event) {

    //if error message is received from server
    if (event.data.type == "error") {
        $(".price").text(event.data.msg);
        return; //exit the function
    }

    //data received from server
    //console.log('Message from server ', event.data);

    /* Sample response:
    {"data":[{"p":220.89,"s":"MSFT","t":1575526691134,"v":100}],"type":"trade"}
    type: message type
    data: [ list of trades ]
    s: symbol of the company
    p: Last price
    t: UNIX milliseconds timestamp
    v: volume (number of orders)
    c: trade conditions (if any)
    */

    var eventData = JSON.parse(event.data);
    if (eventData) {
        if (eventData.data) {
            //get the updated price
            var updatedPrice = JSON.parse(event.data).data[0].p;
            var timeStamp = JSON.parse(event.data).data[0].t;
            console.log(updatedPrice, timeStamp);
            //console.log(new Date(timeStamp).toLocaleTimeString());

            //update the chart for every 6 server events
            //if (counter == 0 || counter % 6 == 0) {
            //    //add price to prices array to reflect the same in chart
            //    prices.push(updatedPrice);

            //    //add time to labels array to reflect the same in chart
            //    var timeStampDate = new Date(timeStamp);
            //    labels.push(timeStampDate.toLocaleTimeString());
            //    chart.update();
            //}
            //counter++;

            //update the UI
            var formattedPrice = updatedPrice.toFixed(2).replace(".", ",");
            $(".price").text(formattedPrice); // Устанавливаем значение с запятой в элементе с классом "price"
            $("#price").val(formattedPrice); // Устанавливаем значение с запятой в скрытом поле "Price"
        }
    }
});

// Unsubscribe
var unsubscribe = function (symbol) {
    //disconnect from server
    socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': symbol }));
}

//when the page is being closed, unsubscribe from the WebSocket
window.onunload = function () {
    unsubscribe(stockSymbol);
};