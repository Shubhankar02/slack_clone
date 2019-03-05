const userName = prompt("What is your username");

// const socket = io('http://localhost:3000'); // the '/' Namespace
const socket = io('http://localhost:3000', {
    query : {
        userName : userName
    }
}); // the '/' Namespace
let nsSocket = "";

// Listen for nsList, which is a list of all the namespaces.
socket.on('nsList', (nsData) => {
    console.log('The list of namespaces has arrived');
    let namespacesDiv = document.querySelector(".namespaces");
    namespacesDiv.innerHTML = "";
    nsData.forEach((ns) => {
        namespacesDiv.innerHTML += `<div class = "namespace" ns= ${ns.endpoint}><img src="${ns.img}" /></div>`
    });

    //  Add a clickListener to namespace
    Array.from(document.getElementsByClassName('namespace')).forEach((element) => {
        // console.log(element);
        element.addEventListener("click", (e) => {
            const nsEndpoint = element.getAttribute('ns');
            // console.log(`${nsEndpoint}, I should go to now`);
            joinNs(nsEndpoint);
        });
    });
});


