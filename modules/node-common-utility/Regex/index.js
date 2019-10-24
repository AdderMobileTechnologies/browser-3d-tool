module.exports = {
    httpURLRegex:/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ig,
    utcSecondsRegex: /[0-9]{10}/,
    mongoDBObjectIDRegex: /[0-9a-fA-F]{24}/i
};