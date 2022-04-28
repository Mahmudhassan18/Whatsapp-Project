//The code is wrapped in a self invoked function in order to avoid polluting the global namespace.
(function(){

/**
 * A user. Can log into the site and chat with other users.
 * Users have their own userIds, username, nicknames, passwords and profile pictures.
 * 
 * @class User
 */
class User {
    constructor(userId, username, nickname, password, pfp) {
        this.userId = userId;
        this.username = username;
        this.nickname = nickname;
        this.password = password;
        this.pfp = pfp;
    }
}

/**
 * The array of all the different users which the website recognizes.
 */
const usersArr = [
    new User(0, "HarryPotter", "Harry", "Wizard1", "images/Harry_Potter.jpg"),
    new User(1, "LukeSkywalker", "Luke", "Jedi2", "images/Luke_Skywalker.png"),
    new User(2, "MartyMcFly", "Marty", "TimeTraveler3", "images/Marty_McFly.jpg"),
    new User(3, "KobeBryant", "Kobe", "Mamba24", "images/kobe.jpeg"),
    new User(4, "LebronJames", "Lebron", "King23", "images/lebron.jpeg")
];

/**
 * The largest amount of characters the text in the added contacts list
 * of the latest message from a contact can have. If the latest message
 * is longer than this length, then its end is replaced with an ellipsis.
 */
const MAX_LATEST_MESSAGE_LENGTH = 50;

/**
 * A map which stores all the messages sent between users.
 * The keys are made up of the userIds of 2 users (the smaller one
 * being the first so 2 users will always generate the same key).
 * The values are arrays of messages.
 */
const messagesMap = new Map();

/**
 * The userId of the user which has logged into the website.
 */
let loggedUser = null;

/**
 * The userId of the selected contact which we can send messages to.
 */
let sendTo = null;

/**
 * The key for the messagesMap of the logged user and the sendTo user.
 */
let messageKey = null;

/**
 * A boolean variable which is true when all of the buttons and message input
 * in the send message tab are enabled.
 */
let areSendMessageTabContentsEnabled = false;

/**
 * The amount of image messages that are currently in the chat.
 */
let amountOfImagesInChat = 0;

/**
 * The amount of video messages that are currently in the chat.
 */
let amountOfVideosInChat = 0;

/**
 * The URL object of the last recording for the audio message.
 */
let messageInputAudioObjectURL = null;

/**
 * A set of all the contacts which have been added so far.
 */
const addedContacts = new Set();

/**
 * A boolean variable which is true when at least one contact has been added.
 */
let hasAContactBeenAdded = false;

/**
 * A map which maps userIds of added contacts, to the div elements
 * of their latest message text in the added contacts list.
 */
const latestMessageDivs = new Map();

/**
 * A map which maps userIds of added contacts, to the div elements
 * of the date of their latest message in the added contacts list.
 */
const latestMessageDateDivs = new Map();

/**
 * The amount of users the website recognizes (the length of usersArr).
 * Note that the website always launches with 5 recognized users, so the amount
 * of users is initialized as 5 and not 0.
 */
let amountOfUsers = 5;

//Every element in the HTML which needs to be accessed and stored into a constant variable is accessed here. 
const loginBox = document.getElementById("login");
const signupBox = document.getElementById("signUp");
const chatBox = document.getElementById("chat");

const inputUsername_login = document.getElementById("inputUsername-login");
const inputPassword_login = document.getElementById("inputPassword-login");
const inputUsername_signup = document.getElementById("inputUsername-signup");
const inputNickname = document.getElementById("inputNickname");
const inputPassword_signup = document.getElementById("inputPassword-signup");
const passwordVerfication = document.getElementById("verifyPassword");
const inputPfp = document.getElementById("inputPfp");

const userInfo = document.getElementById("user-info");
const inputContact = document.getElementById("inputContact");
const chatList = document.getElementById("chatList");
const closeAddContact = document.getElementById("closeAddContact");
const closeImageModalButton = document.getElementById("closeImageModalButton");
const closeVideoModalButton = document.getElementById("closeVideoModalButton");
const closeMicrophoneModalButton = document.getElementById("closeMicrophoneModalButton");
const sentChat = document.getElementById("sentChat");
const contactInChat = document.getElementById("contactInChat");

const messageInputImage = document.getElementById("messageInputImage");
const messageInputVideo = document.getElementById("messageInputVideo");

const imageButton = document.getElementById("imageButton");
const videoButton = document.getElementById("videoButton");
const microphoneButton = document.getElementById("microphoneButton");
const text_message_to_send = document.getElementById("message-to-send");
const sendTextMessageButton = document.getElementById("sendTextMessageButton");

//All of the buttons and the message input in the send message tab are disabled by default.
//They will be enabled once a contact is selected.
imageButton.disabled = true;
videoButton.disabled = true;
microphoneButton.disabled = true;
text_message_to_send.disabled = true;
sendTextMessageButton.disabled = true;


//loginButton calls login() when clicked
document.getElementById("loginButton").addEventListener("click", logIn);

//registerButton calls hideLogin() when clicked (hides the login forms and shows the signup form instead)
document.getElementById("registerButton").addEventListener("click", hideLogin);

//signUpButton calls signUp() when clicked
document.getElementById("signUpButton").addEventListener("click", signUp);

//alreadyRegisteredButton calls hideSignup() when clicked (hides the signup forms and shows the login form instead)
document.getElementById("alreadyRegisteredButton").addEventListener("click", hideSignup);

//addContactButton calls addContact() when clicked
document.getElementById("addContactButton").addEventListener("click", addContact);


//sendImageMessageButton sends a new image message when clicked and passes the id of the logged user,
//unless the user is yet to have chosen an image, in which case an alert will be sent.
document.getElementById("sendImageMessageButton").addEventListener("click", () => {
    if (messageInputImage.value != "") {
        sendMessage(new ImageMessage(loggedUser, URL.createObjectURL(messageInputImage.files[0])));
    } else {
        alert("You haven't chosen an image yet")
    }
});

//sendVideoMessageButton sends a new video message when clicked and passes the id of the logged user,
//unless the user is yet to have chosen a video, in which case an alert will be sent.
document.getElementById("sendVideoMessageButton").addEventListener("click", () => {
    if (messageInputVideo.value != "") {
        sendMessage(new VideoMessage(loggedUser, URL.createObjectURL(messageInputVideo.files[0])));
    } else {
        alert("You haven't chosen a video yet");
    }
});

//sendAudioMessageButton sends a new audio message when clicked and passes the id of the logged user,
//unless the user is yet to have recorded an audio message, in which case an alert will be sent.
document.getElementById("sendAudioMessageButton").addEventListener("click", () => {
    if (messageInputAudioObjectURL != null) {
        sendMessage(new AudioMessage(loggedUser, messageInputAudioObjectURL));
    } else {
        alert("You haven't recorded a message yet");
    }
});

//sendTextMessageButton sends a new text message when clicked and passes the id of the logged user,
//unless the user is yet to have typed a text message, in which case nothing will happen.
sendTextMessageButton.addEventListener("click", () => {
    if (text_message_to_send.value != "") {
        sendMessage(new TextMessage(loggedUser, text_message_to_send.value));
    }
});


//closeMicrophoneModalButton clears the URL object of the latest recording when clicked.
//This way the same message can't be sent again.
document.getElementById("closeMicrophoneModalButton").addEventListener("click", () => { messageInputAudioObjectURL = null; });


/**
 * A text message. Has the userId of the user who sent it, the content of the message
 * which is a string, and the date in which it has been sent.
 * Can write the text message it represents in the document (meaning, in the chat in
 * the HTML document), and can generate a text for the latest message text in the
 * added contacts list.
 * 
 * @class TextMessage
 */
class TextMessage {
    /**
     * The constructor of TextMessage.
     * 
     * @param {number} senderId 
     * @param {string} content 
     */
    constructor(senderId, content) {
        this.senderId = senderId;
        this.date = new Date();
        this.content = this.addNewlines(content);
    }
/**
 * Adds a new line after every 100 chars
 * if a space found in first 100 chars it adds a new line to the last space
 * if not it adds a new line at index 100
 * @param {message that's being sent} str 
 * @returns new message with new line every 100 chars
 */
    addNewlines(str) {
        let result = '';
        while (str.length > 0) {
            let lastHundred = str.lastIndexOf(' ', 100);
            if(lastHundred == -1){
                result += str.substring(0, 100) + '\n';
                str = str.substring(100);
            }
            else{
                result += str.substring(0, lastHundred+1) + '\n';
                str = str.substring(lastHundred+1);
            }
        }
        return result;
    }

    /**
     * Writes the text message in the document (meaning, in the chat in the HTML document).
     * 
     * @param {boolean} wasSentByLoggedUser A boolean variable which is true when the message has been sent
     * by the logged user. Used for determining the class of the speech bubble of the message.
     */
    writeMessageInDocument(wasSentByLoggedUser) {
        //Creaing the row and col divs in which the message is
        const rowDiv = document.createElement("div");
        const colDiv = document.createElement("div");

        //Creating the span which holds the message
        const spanD = document.createElement("span");
    
        //Creating the text node with the message
        const messageText = document.createTextNode(this.content);
    
        //Setting the classes of the divs and the span
        rowDiv.className = "row";
        colDiv.className = "col";
        spanD.className = wasSentByLoggedUser ? "usersSpeechBubble" : "othersSpeechBubble";
    
        //Appending the elements: the span inside the col div inside the row div inside sentChat
        spanD.appendChild(messageText);
        colDiv.appendChild(spanD);
        rowDiv.appendChild(colDiv);
        sentChat.appendChild(rowDiv);
    
        //Clearing the message input in the send message tab
        text_message_to_send.value = "";

        //Scrolling down in the chat
        scrollChat();
    }

    /**
     * Generates a string which represents the message, for the latest
     * message text in the added contacts list.
     * 
     * @returns A string which represents the content of the message.
     */
    generateLatestMessageText() {
        return cutLongString(this.content, MAX_LATEST_MESSAGE_LENGTH);
    }
}


/**
 * An image message. Has the userId of the user who sent it, the content of the message
 * which is a URL object of an image, and the date in which it has been sent.
 * Can write the image message it represents in the document (meaning, in the chat in
 * the HTML document), and can generate a text for the latest message text in the
 * added contacts list.
 * 
 * @class ImageMessage
 */
class ImageMessage {
    /**
     * The constructor of ImageMessage.
     * 
     * @param {number} senderId 
     * @param {URL} content 
     */
    constructor(senderId, content) {
        this.senderId = senderId;
        this.date = new Date();
        this.content = content;
    }

    /**
     * Writes the image message in the document (meaning, in the chat in the HTML document).
     * 
     * @param {boolean} wasSentByLoggedUser A boolean variable which is true when the message has been sent
     * by the logged user. Used for determining the class of the speech bubble of the message.
     */
    writeMessageInDocument(wasSentByLoggedUser) {
        //Creating the modal id for this image with amountOfImagesInChat,
        //and incrementing amountOfImagesInChat by 1
        const modalId = "messageImage" + amountOfImagesInChat;
        amountOfImagesInChat++;
    
    
        //Creaing the row and col divs in which the message is
        const input = document.createElement("div");
        input.className = "row";
        const col = document.createElement("div");
        col.className = "col";
    
        //Creating the span which holds the message. Its class is determined by wasSentByLoggedUser.
        const speechBubbleSpan = document.createElement("span");
        speechBubbleSpan.className = wasSentByLoggedUser ? "usersSpeechBubble img-message" : "othersSpeechBubble img-message";
    
        //Creating the button for the image modal
        const imageModalButton = document.createElement("button");
        imageModalButton.type = "button";
        imageModalButton.className = "btn";
        imageModalButton.setAttribute("data-bs-toggle", "modal");
        imageModalButton.setAttribute("data-bs-target", "#" + modalId);
    
        //The button itself contains the image
        const imageInSpeechBubble = document.createElement("img");
        imageInSpeechBubble.src = this.content;
        imageInSpeechBubble.style.width = "200px";
        imageModalButton.appendChild(imageInSpeechBubble);

        //Appending elements: The imageModalButton inside the speechBubbleSpan inside col
        speechBubbleSpan.appendChild(imageModalButton);
        col.appendChild(speechBubbleSpan);
    
    
        //Creating the modal div
        const modalDiv = document.createElement("div");
        modalDiv.className = "modal fade";
        modalDiv.id = modalId;
        modalDiv.tabIndex = -1;
        modalDiv.setAttribute("aria-labelledby", "messagePicLabel");
        modalDiv.setAttribute("aria-hidden", "true");
    
        //Creating the divs of the modal-dialog and modal-content
        const modalDialogDiv = document.createElement("div");
        modalDialogDiv.className = "modal-dialog";
        const modalContentDiv = document.createElement("div");
        modalContentDiv.className = "modal-content";
    
        //Creating the modal header div
        const modalHeader = document.createElement("div");
        modalHeader.className = "modal-header";
    
        //Creating the button in the modal header which closes the modal
        const closeModalButton = document.createElement("button");
        closeModalButton.type = "button";
        closeModalButton.className = "btn-close";
        closeModalButton.setAttribute("data-bs-dismiss", "modal");
        closeModalButton.setAttribute("aria-label", "Close");

        //Appending elements: closeModalButton inside the modalHeader inside modalContentDiv
        modalHeader.appendChild(closeModalButton);
        modalContentDiv.appendChild(modalHeader);
    
    
        //Creating the modal body div
        const modalBodyDiv = document.createElement("div");
        modalBodyDiv.className = "modal-body";
    
        //Creating the image inside the modal body
        const imageInModal = document.createElement("img");
        imageInModal.src = this.content;
        imageInModal.style.width = "100%";
    
        //Appending elements: imageInModal inside modalBodyDiv inside modalContentDiv
        modalBodyDiv.appendChild(imageInModal);
        modalContentDiv.appendChild(modalBodyDiv);
    
        //Appending elements: modalContentDiv inside modalDialogDiv inside modalDiv
        //inside col inside input inside sentChat
        modalDialogDiv.appendChild(modalContentDiv);
        modalDiv.appendChild(modalDialogDiv);
        col.appendChild(modalDiv);
        input.appendChild(col);
        sentChat.appendChild(input);

        //After the message is send, the messageInputImage is cleared.
        //This way the same message can't be sent again.
        messageInputImage.value = "";

        //Closing the modal and scrolling down in the chat
        closeImageModalButton.click();
        scrollChat();
    }

    /**
     * Generates a string which represents the message, for the latest
     * message text in the added contacts list.
     * 
     * @returns "Image"
     */
    generateLatestMessageText() {
        return "Image";
    }
}


/**
 * A video message. Has the userId of the user who sent it, the content of the message
 * which is a URL object of a video, and the date in which it has been sent.
 * Can write the video message it represents in the document (meaning, in the chat in
 * the HTML document), and can generate a text for the latest message text in the
 * added contacts list.
 * 
 * @class VideoMessage
 */
class VideoMessage {
    /**
     * The constructor of VideoMessage.
     * 
     * @param {number} senderId 
     * @param {URL} content 
     */
    constructor(senderId, content) {
        this.senderId = senderId;
        this.date = new Date();
        this.content = content;
    }

    /**
     * Writes the video message in the document (meaning, in the chat in the HTML document).
     * 
     * @param {boolean} wasSentByLoggedUser A boolean variable which is true when the message has been sent
     * by the logged user. Used for determining the class of the speech bubble of the message.
     */
    writeMessageInDocument(wasSentByLoggedUser) {
        //Creating the modal id for this video with amountOfVideosInChat,
        //and incrementing amountOfVideosInChat by 1
        const modalId = "messageVideo" + amountOfVideosInChat;
        amountOfVideosInChat++;
    
    
        //Creaing the row and col divs in which the message is
        const input = document.createElement("div");
        input.className = "row";
        const col = document.createElement("div");
        col.className = "col";
    
        //Creating the span which holds the message. Its class is determined by wasSentByLoggedUser.
        const speechBubbleSpan = document.createElement("span");
        speechBubbleSpan.className = wasSentByLoggedUser ? "usersSpeechBubble img-message" : "othersSpeechBubble img-message";

        //Creating the button for the video modal
        const videoModalButton = document.createElement("button");
        videoModalButton.type = "button";
        videoModalButton.className = "btn";
        videoModalButton.setAttribute("data-bs-toggle", "modal");
        videoModalButton.setAttribute("data-bs-target", "#" + modalId);

        //The button itself contains a video element of the video
        //(inside the button we see the first frame from the video)
        const videoInSpeechBubble = document.createElement("video");
        videoInSpeechBubble.width = 320;
        videoInSpeechBubble.height = 240;
        const videoInSpeechBubbleSource = document.createElement("source");
        videoInSpeechBubbleSource.src = this.content;
        videoInSpeechBubbleSource.type = "video/mp4";
        videoInSpeechBubble.appendChild(videoInSpeechBubbleSource);

        //Appending elements: videoInSpeechBubble inside videoModalButton inside speechBubbleSpan inside col
        videoModalButton.appendChild(videoInSpeechBubble);
        speechBubbleSpan.appendChild(videoModalButton);
        col.appendChild(speechBubbleSpan);


        //Creating the modal div
        const modalDiv = document.createElement("div");
        modalDiv.className = "modal fade";
        modalDiv.id = modalId;
        modalDiv.tabIndex = -1;
        modalDiv.setAttribute("aria-labelledby", "messagePicLabel");
        modalDiv.setAttribute("aria-hidden", "true");

        //The modal can't be closed by pressing outside of it or clicking escape
        //This is because and event is added when the close button is clicked,
        //and the modal shouldn't be closed without that event
        modalDiv.setAttribute("data-bs-backdrop", "static");
        modalDiv.setAttribute("data-bs-keyboard", "false");
    
        //Creating the divs of the modal-dialog and modal-content
        const modalDialogDiv = document.createElement("div");
        modalDialogDiv.className = "modal-dialog";
        const modalContentDiv = document.createElement("div");
        modalContentDiv.className = "modal-content";

        //Creating the modal header div
        const modalHeader = document.createElement("div");
        modalHeader.className = "modal-header";

        //Creating the button in the modal header which closes the modal
        const closeModalButton = document.createElement("button");
        closeModalButton.type = "button";
        closeModalButton.className = "btn-close";
        closeModalButton.setAttribute("data-bs-dismiss", "modal");
        closeModalButton.setAttribute("aria-label", "Close");

        //Appending elements: closeModalButton inside modalHeader inside modalContentDiv
        modalHeader.appendChild(closeModalButton);
        modalContentDiv.appendChild(modalHeader);
    

        //Creating the modal body div
        const modalBodyDiv = document.createElement("div");
        modalBodyDiv.className = "modal-body";

        //Creating the video inside the modal body
        const videoInModal = document.createElement("video");
        videoInModal.style.width = "100%";
        videoInModal.controls = true;


        //When closeModalButton is clicked, the video will be paused and
        //the current play time will reset to the start
        closeModalButton.addEventListener("click", () => {
            videoInModal.pause();
            videoInModal.currentTime = 0;        
        });

        //Creating the source element for videoInModal and appending it
        const videoInModalSource = document.createElement("source");
        videoInModalSource.src = this.content;
        videoInModalSource.type = "video/mp4";
        videoInModal.appendChild(videoInModalSource);

        //Appending elements: videoInModal inside modalBodyDiv inside modalContentDiv
        modalBodyDiv.appendChild(videoInModal);
        modalContentDiv.appendChild(modalBodyDiv);

        //Appending elements: modalContentDiv inside modalDialogDiv inside modalDiv
        //inside col inside input inside sentChat
        modalDialogDiv.appendChild(modalContentDiv);
        modalDiv.appendChild(modalDialogDiv);
        col.appendChild(modalDiv);
        input.appendChild(col); 
        sentChat.appendChild(input);

        //After the message is send, the messageInputVideo is cleared.
        //This way the same message can't be sent again.
        messageInputVideo.value = "";

        //Closing the modal and scrolling down in the chat
        closeVideoModalButton.click();
        scrollChat();
    }

    /**
     * Generates a string which represents the message, for the latest
     * message text in the added contacts list.
     * 
     * @returns "Video"
     */
    generateLatestMessageText() {
        return "Video";
    }
}


/**
 * An audio message. Has the userId of the user who sent it, the content of the message
 * which is a URL object of a recording, and the date in which it has been sent.
 * Can write the audio message it represents in the document (meaning, in the chat in
 * the HTML document), and can generate a text for the latest message text in the
 * added contacts list.
 * 
 * @class AudioMessage
 */
class AudioMessage {
    /**
     * The constructor of AudioMessage.
     * 
     * @param {number} senderId 
     * @param {URL} content 
     */
    constructor(senderId, content) {
        this.senderId = senderId;
        this.date = new Date();
        this.content = content;
    }

    /**
     * Writes the audio message in the document (meaning, in the chat in the HTML document).
     * 
     * @param {boolean} wasSentByLoggedUser A boolean variable which is true when the message has been sent
     * by the logged user. Used for determining the class of the speech bubble of the message.
     */
    writeMessageInDocument(wasSentByLoggedUser) {
        //Creaing the row and col divs in which the message is
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        const colDiv = document.createElement("div");
        colDiv.className = "col";

        //Creating the span which holds the message. Its class is determined by wasSentByLoggedUser.
        const speechBubbleSpan = document.createElement("span");
        speechBubbleSpan.className = wasSentByLoggedUser ? "usersSpeechBubble" : "othersSpeechBubble";

        //Creating an audio element which can play the recording
        const audioElement = document.createElement("audio");
        audioElement.controls = true;
        const audioSource = document.createElement("source");
        audioSource.src = this.content;
        audioSource.type = "audio/mpeg";
        audioElement.appendChild(audioSource);

        //Appending elements: audioElement inside speechBubbleSpan
        //inside colDiv inside rowDiv inside sentChat
        speechBubbleSpan.appendChild(audioElement);
        colDiv.appendChild(speechBubbleSpan);
        rowDiv.appendChild(colDiv);
        sentChat.appendChild(rowDiv);

        //After the message is send, the URL object of the latest recording is cleared.
        //This way the same message can't be sent again.
        messageInputAudioObjectURL = null;

        //Closing the modal and scrolling down in the chat
        closeMicrophoneModalButton.click();
        scrollChat();
    }

    /**
     * Generates a string which represents the message, for the latest
     * message text in the added contacts list.
     * 
     * @returns "Audio"
     */
    generateLatestMessageText() {
        return "Audio";
    }
}

//Creating some messages between the users
messagesMap.set("0:1", [new TextMessage(0, "I'm a wizard"), new TextMessage(1, "I'm a jedi")]);
messagesMap.set("0:2", [new TextMessage(2, "I'm a time traveler"), new TextMessage(0, "I also time traveled in my third book")]);
messagesMap.set("1:2", [new TextMessage(2, "Did you ever hear the tragedy of Darth Plagueis The Wise?"), new TextMessage(1, "Yup...")]);
messagesMap.set("3:4", [new TextMessage(3, "GOOD GAME TODAY"), new ImageMessage(3, "images/lebronstats.jpeg"), new TextMessage(4, "Appreciate That!!")]);

/**
 * Login functions checks wheter the username and password
 * that got entered is found in users map, and triggers
 * show chat function that shoes chat file
 * and getchat that get the chat of a the specific user
 */
function logIn() {
    const inputUsername_login_val = inputUsername_login.value;
    const inputPassword_login_val = inputPassword_login.value;
    const amountOfUsers = usersArr.length;
    for (let i = 0; i < amountOfUsers; i++) {
        if (inputUsername_login_val.toLowerCase() == usersArr[i].username.toLowerCase() && inputPassword_login_val == usersArr[i].password) {
            loggedUser = usersArr[i].userId;
            showChat();
            getChat(usersArr[i].nickname, usersArr[i].pfp);
            return;
        }
    }
    alert("Wrong username or password");
}

/**
 * signup function that allow new users to sign in and adds them to users map
 * and does regular check oover password and username entered
 */
function signUp() {
    //gets values entered
    const inputUsername_signup_val = inputUsername_signup.value;
    const inputNickname_val = inputNickname.value;
    const inputPassword_signup_val = inputPassword_signup.value;
    const passwordVerfication_val = passwordVerfication.value;
    //check if every filed is not empty
    if (inputUsername_signup_val == "" || inputNickname_val == "" || inputPassword_signup_val == "" || passwordVerfication_val == "") {
        alert("You must fill all fields");
        return;
    }

    //Checks if user alreadu exists
    for (let i = 0; i < amountOfUsers; i++) {
        if (inputUsername_signup_val == usersArr[i].username) {
            alert("There already exists a user with this username");
            return;
        }
    }

    //does normal check over password entered (length, uppercase, etc...)
    const passwordLen = inputPassword_signup_val.length;
    let isThereADigit = false;
    let isThereAnUppercaseLetter = false;
    let isThereALowercaseLetter = false;

    for (let i = 0; i < passwordLen; i++) {
        if ('0' <= inputPassword_signup_val[i] && inputPassword_signup_val[i] <= '9') {
            isThereADigit = true;
        }
        if ('A' <= inputPassword_signup_val[i] && inputPassword_signup_val[i] <= 'Z') {
            isThereAnUppercaseLetter = true;
        }
        if ('a' <= inputPassword_signup_val[i] && inputPassword_signup_val[i] <= 'z') {
            isThereALowercaseLetter = true;
        }
    }

    if (!isThereADigit || !isThereAnUppercaseLetter || !isThereALowercaseLetter) {
        alert("A password must contain at least 1 digit, 1 uppercase letter and 1 lowercase letter");
        return;
    }

    if (inputPassword_signup_val != passwordVerfication_val) {
        alert("The password verification does not match");
        return;
    }

    amountOfUsers++;

    //cehck if user didn't enter an images it put the default image
    if (inputPfp.value == ""){
        var inputPfp_val = "defaultProfile.jpeg"
    } else {
        var inputPfp_val = URL.createObjectURL(inputPfp.files[0]);
    }

    //adds user to userarr
    usersArr.push(new User(amountOfUsers - 1, inputUsername_signup_val, inputNickname_val, inputPassword_signup_val, inputPfp_val));

    hideSignup();
}

/**
 * Add sent message to messages box
 * @param {Message} message message need to be added
 */
function sendMessage(message) {
    if (message.content != '') {
        //adds to message map
        addMessageToMessagesMap(message);
        //writes message in document
        message.writeMessageInDocument(message, true);
        //updates latest message
        updateLatestMessage(message, sendTo);
    }
}

/**
 * Adds message to the message map
 * @param {Message} message message to need to be added to message map 
 */
function addMessageToMessagesMap(message) {
    if (messagesMap.has(messageKey)) {
        messagesList = messagesMap.get(messageKey);
        messagesList.push(message);
    } else {
        messagesMap.set(messageKey, [message]);
    }
}

/**
 * loads contact message to message chat box
 * by using their userId
 * 
 * @param {number} contactId contact's add that messages need to be added
 */
function loadContactMessages(contactId) {
    if (contactId == sendTo) {
        return;
    }
    
    if (!areSendMessageTabContentsEnabled) {
        enableSendMessageTabContents();
        areSendMessageTabContentsEnabled = true;
    }

    sendTo = contactId;
    messageKey = getKeyOfTwoUsers(loggedUser, sendTo);

    sentChat.innerHTML = "";
    amountOfImagesInChat = 0;
    amountOfVideosInChat = 0;

    if (messagesMap.has(messageKey)) {
        messagesList = messagesMap.get(messageKey);
        const amountOfMessages = messagesList.length;

        for (let i = 0; i < amountOfMessages; i++) {
            const message = messagesList[i];
            message.writeMessageInDocument(loggedUser == message.senderId);
        }
    }
}

/**
 * return the key of two users which returns first 
 * the smaller id bu valus
 * 
 * @param {number} userId1 The userId of the first user.
 * @param {number} userId2 The userId of the second user.
 * @returns key for messagesMap of two users
 */
function getKeyOfTwoUsers(userId1, userId2) {
    if (userId1 < userId2) {
        var key = userId1 + ":" + userId2;
    } else {
        var key = userId2 + ":" + userId1;
    }
    return key;
}

/**
 * Enables all button when pressed on a contact
 */
function enableSendMessageTabContents() {
    imageButton.disabled = false;
    videoButton.disabled = false;
    microphoneButton.disabled = false;
    text_message_to_send.disabled = false;
    sendTextMessageButton.disabled = false;
}

/**
 * Updates latest message when a new message in sent
 * 
 * @param {Message} latestMessage A message object
 * @param {number} contactId The userId of the contact to which the latest message text
 * will be added next to in the added contacts list
 */
function updateLatestMessage(latestMessage, contactId) {
    latestMessageDivs.get(contactId).innerHTML = latestMessage.generateLatestMessageText();
    latestMessageDateDivs.get(contactId).innerHTML = latestMessage.date.toUTCString();
}

/**
 * When pressed on specifec contact it load their
 * info (name and image) to the upper top box
 * 
 * @param {string} nickname nickname of contact
 * @param {URL} profile profile picture
 */
function loadContactInChat(nickname, profile) {
    const colDiv = document.createElement("div");
    const userImg = document.createElement("img");
    const userNickname = document.createTextNode(nickname);
    userImg.src = profile;
    userImg.alt = "Avatar";
    userImg.style.width = "60px";
    userImg.style.height = "60px";
    userImg.style.borderRadius = "50%";
    userImg.style.marginRight = "5px";
    colDiv.setAttribute("class", "col", "user");;
    userImg.className = "contact-profile";

    contactInChat.innerHTML = "";

    colDiv.appendChild(userImg);
    colDiv.appendChild(userNickname);
    contactInChat.appendChild(colDiv);
}

/**
 * When pressed on add contact button, to add an already existing cxontact
 * it add then to the left side of the screen in contact area,
 * and also check if contact exists in contacts array
 */
function addContact() {
    const inputContact_val = inputContact.value;
    if (inputContact_val == "") {
        alert("You must fill the contact's username field");
        return;
    }

    let contact = null;
    for (let i = 0; i < amountOfUsers; i++) {
        if (inputContact_val.toLowerCase() == usersArr[i].username.toLowerCase()) {
            contact = usersArr[i];
            break;
        }
    }
    //if enterd contact doed not exist
    if (contact == null) {
        alert("There is no user with this username");
        return;
    }

    //check if added contact is same as logged one
    if (contact.userId == loggedUser) {
        alert("You cannot add yourself as a contact");
        return;
    }

    //check if contact already added
    if (addedContacts.has(contact.userId)) {
        alert("This contact has already been added")
        return;
    }
    addedContacts.add(contact.userId);

    if (!hasAContactBeenAdded) {
        chatList.innerHTML = "";
        hasAContactBeenAdded = true;
    }

    //get's added contact latest message
    const latestMessage = getLatestMessage(loggedUser, contact.userId);
    if (latestMessage == null) {
        var latestMessageGeneratedText = "";
        var latestMessageDate = "";
    } else {
        var latestMessageGeneratedText = latestMessage.generateLatestMessageText();
        var latestMessageDate = latestMessage.date.toUTCString();
    }

    //creats html file to add to the document
    const listItemOfContact = document.createElement("li");
    listItemOfContact.className = "list-group-item d-flex justify-content-between align-items-start";
    listItemOfContact.addEventListener("click", () => {loadContactMessages(contact.userId); loadContactInChat(contact.nickname, contact.pfp);});

    const contactPfpElement = document.createElement("img");
    contactPfpElement.src = contact.pfp;
    contactPfpElement.alt = "Avatar";
    contactPfpElement.className = "contact-profile";

    listItemOfContact.appendChild(contactPfpElement);

    const contactDataDiv = document.createElement("div");
    contactDataDiv.className = "ms-2 me-auto";

    const nicknameDiv = document.createElement("div");
    nicknameDiv.className = "fw-bold";
    nicknameDiv.appendChild(document.createTextNode(contact.nickname));

    contactDataDiv.appendChild(nicknameDiv);

    const latestMessageDiv = document.createElement("div");
    latestMessageDiv.appendChild(document.createTextNode(latestMessageGeneratedText));

    latestMessageDivs.set(contact.userId, latestMessageDiv);
    contactDataDiv.appendChild(latestMessageDiv);

    const latestMessageDateDiv = document.createElement("div");
    latestMessageDateDiv.className = "latest-message-date";
    latestMessageDateDiv.appendChild(document.createTextNode(latestMessageDate));

    latestMessageDateDivs.set(contact.userId, latestMessageDateDiv);
    contactDataDiv.appendChild(latestMessageDateDiv);

    listItemOfContact.appendChild(contactDataDiv);
    chatList.appendChild(listItemOfContact);

    closeAddContact.click();
    inputContact.value = "";
}

/**
 * Gets latest message between two users
 * and returns it
 * 
 * @param {number} userId1 The userId of the first user.
 * @param {number} userId2 The userId of the second user.
 * @return The latest message between these 2 users.
*/

function getLatestMessage(userId1, userId2) {
    const messageKeyOfThe2Users = getKeyOfTwoUsers(userId1, userId2);
    if (messagesMap.has(messageKeyOfThe2Users)) {
        messagesList = messagesMap.get(messageKeyOfThe2Users);
        const amountOfMessages = messagesList.length;
        const latestMessage = messagesList[amountOfMessages - 1];
        return latestMessage;
    } else {
        return null;
    }
}

/**
 * When a message goes over maxLength char
 * it cuts it to first maxLength and adds ... to the end of it
 * 
 * @param {string} text text that needs to be cutted
 * @param {number} maxLength The maximum length of the new text
 * @returns the new text
 */
function cutLongString(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength - 3) + "...";
    } else {
        return text;
    }
}

/**
 * when login succeeds or signup is pressed
 * it hides the login screen
 */
function hideLogin() {
    event.preventDefault();
    signupBox.style.visibility = "visible";
    loginBox.style.visibility = "hidden";
}

/**
 * when signup succeeds or login is pressed
 * it hides the signup screen
 */
function hideSignup() {
    event.preventDefault();
    signupBox.style.visibility = "hidden";
    loginBox.style.visibility = "visible";
}

/**
 * when login succeeds it shows chat box screen
 */
function showChat() {
    event.preventDefault();
    signupBox.style.visibility = "hidden";
    loginBox.style.visibility = "hidden";
    chatBox.style.visibility = "visible";
}

/**
 * When a user signin it get the chat that 
 * is releated to him and adds it to chat box
 * with ther name and image
 * @param {string} nickname user nickname that get displayed
 * @param {URL} picture user image to get displayed
 */
function getChat(nickname, picture) {
    userInfo.innerHTML = ""
    //creats html document to add to the main document
    const userImg = document.createElement("img");
    userImg.src = picture;
    userImg.style.width = "60px";
    userImg.style.borderRadius = "50%";
    userImg.style.marginRight = "5px";
    const nicknameTextNode = document.createTextNode(nickname);

    userInfo.appendChild(userImg);
    userInfo.appendChild(nicknameTextNode);
}

/**
 * Whenever a chat is sent it scroll to the bottom
 * to show the new chat
 */
function scrollChat(){
    sentChat.scrollTop = sentChat.scrollHeight;
}


//An audio recorder
let audioRecorder;

//startRecordingButton calls startRecording() when clicked
document.getElementById("startRecordingButton").addEventListener("click", startRecording);

//stopRecordingButton calls stopRecording() when clicked
document.getElementById("stopRecordingButton").addEventListener("click", stopRecording);

/**
 * Generates a new audio recorder.
 * 
 * @returns An audio recorder.
 * @async
 */
async function generateAudioRecorder() {
    //Awaiting the creation of an audio media stream
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    //Creating a media recorder with the audio media stream
    const mediaRecorder = new MediaRecorder(mediaStream);

    //An array which stores the data chunks of the recording.
    //When there's data available for mediaRecorder, it will push it in audioChunks.
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
    });

    //The start function starts the media recorder.
    const start = () => {
        mediaRecorder.start();
    };

    //The stop function adds an event when the media recorder stops. audioChunks will be used in order
    //to create a URL object of the recording.
    //Then the function stops the media recorder.
    //The function returns a promise which will resolve once the stop event finishes. The resolved promise
    //will return the URL object. 
    const stop = () => {
        return new Promise(resolve => {
            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                resolve(audioUrl);
            });

            mediaRecorder.stop();
        });
    };

    //Returning the audio recorder, which is an object which has the start and stop funtions.
    return {start, stop};
};

/**
 * Generates a new audio recorder and starts a recording.
 * 
 * @async
 */
async function startRecording() {
    audioRecorder = await generateAudioRecorder();
    audioRecorder.start();
}

/**
 * Stops an ongoing recording and deletes the previous audio recorder.
 * If there isn't an ongoing recorder then nothing happens.
 * 
 * @async
 */
async function stopRecording() {
    //An audio recorder is generated when startRecording() is called and deleted
    //when stopRecording() is called. So (audioRecorder != null) only if there's
    //a recording going on.
    if (audioRecorder == null) {
        return;
    }
    messageInputAudioObjectURL = await audioRecorder.stop();
    audioRecorder = null;
}

})();