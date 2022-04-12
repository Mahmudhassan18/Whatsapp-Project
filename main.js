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

var alertPlaceholder = document.getElementById('liveAlertPlaceholder')


function alert(message, type) {
  var wrapper = document.createElement('div')
  wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'

  alertPlaceholder.append(wrapper)
}


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
    if(found == 0){
        alert("Wrong username or password", 'success')

    }

}
