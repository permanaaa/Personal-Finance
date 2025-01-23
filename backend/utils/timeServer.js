function timeServer() {
    const nowUtc = new Date();
    const jakartaOffset = 7 * 60 * 60 * 1000;

    return new Date(nowUtc.getTime() + jakartaOffset);
}

function convertTimeServer(date) {
    const nowUtc = new Date(date);
    const jakartaOffset = 7 * 60 * 60 * 1000;
    const jakartaDate = new Date(nowUtc.getTime() + jakartaOffset);
    const userHour = nowUtc.getHours();
    const userMinute = nowUtc.getMinutes();
    jakartaDate.setHours(userHour, userMinute, 0, 0);

    return jakartaDate;
}

function convertToMilisecond(date) {
    const nowUtc = new Date(date);
    const jakartaOffset = 7 * 60 * 60 * 1000;

    return nowUtc.getTime() + jakartaOffset;
}

function formatDate(inputDate) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [day, month, year] = inputDate.split("/");
    const formattedDate = `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;

    return formattedDate;
}

module.exports = {
    timeServer,
    convertTimeServer,
    convertToMilisecond,
    formatDate
}
