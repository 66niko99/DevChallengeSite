$(document).ready(async function () {
    window.setInterval(function () {
        LoadQueue();
    }, 1000);
})

function LoadQueue() {
    try {
        var session = atob(GetCookie("session"))
        var queueTime = GetRemainingQueueTimeFromSession(session);

        console.log(queueTime);
        
        if (typeof(queueTime) != typeof(1)) {
            console.error(queueTime);
            $("#queue-modal span").hide()
        } else {
            $("#queue-modal span").show()
            $("#queue-time").text(queueTime);
        }
    } catch (e){
        console.log(e)
        $("#queue-modal span").hide()
    }
}

function GetRemainingQueueTimeFromSession(sessionId) {
    try {
        var queueId = JSON.parse(sessionId)["queueId"]
        return getRemainingQueueTimeFromId(queueId)
    } catch (e) {
        return e
    }

}

function getRemainingQueueTimeFromId(queueId) {
    try {
        var queueEndTimestamp = 0;
        var split = atob(queueId).split("|")
        split.shift();

        for (i = 0; i < split.length; i++) {
            var dur = parseInt(split[i])
            queueEndTimestamp += isNaN(dur) ? 0 : dur
        }

        var remaining = Math.floor((queueEndTimestamp - new Date().getTime()) / 1000)
        return remaining <= 0 ? 0 : remaining
    } catch (e) {
        return e
    }

}

function GetCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}