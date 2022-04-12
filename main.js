var usersObj = [
    {
        username: "html",
        passwrod: "html"
    },
    {
        username: "html1",
        passwrod: "html1"
    },
    {
        username: "html2",
        passwrod: "html2"
    }
]


function logIn(){
    var username = document.getElementById("inputUsername").value
    var password = document.getElementById("inputPassword").value
    var found = 0;
    for(i=0; i < usersObj.length; i++){
        if(username == usersObj[i].username && password == usersObj[i].passwrod){
            var found = 1;
            window.location.href="chat.html";
        }
    }
    if(!found){
        alert("Wrong username or password")
    }
}


