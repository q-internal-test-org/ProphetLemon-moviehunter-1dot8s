const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const notificationModel = require('../models/notificationSchema')
const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb(process.env.MOVIEDB_API)
const ALERTS_TYPES = {
    SUCCESS: 'success',
    INFO: 'primary',
    WARNING: 'warning',
    DANGER: 'danger'
}

const ENUM_ALERTS = {
    es: {
        NOTIFICATION: {
            UNEXPECTED_ERROR: createAlert(ALERTS_TYPES.DANGER, '<b>Ha habido un error al procesar los datos. Cierre la ventana y vuelva a intentarlo</b>'),
            EMAIL_ADRESS: createAlert(ALERTS_TYPES.DANGER, '<b>Inserta un email valido</b>'),
            NOTIFICATION_REPEAT: createAlert(ALERTS_TYPES.INFO, `<b>Ya tienes una notificación preparada</b>`),
            SUCCESS: createAlert(ALERTS_TYPES.SUCCESS, '<b>Se ha creado la notificación correctamente</b>.<br>Una vez se envie la notificación, su email será borrado de nuestra base de datos.')
        },
        EMAIL: {
            SUBJECT_MOVIE: '¡Tu película ya está disponible!',
            SUBJECT_TV: '¡Tu serie ya está disponible!',
            TEXT_MOVIE_BEFORE: 'La película',
            TEXT_TV_BEFORE: 'La serie',
            TEXT_AFTER: 'ya está disponible en:'
        }
    },
    de: {
        NOTIFICATION: {
            UNEXPECTED_ERROR: createAlert(ALERTS_TYPES.DANGER, '<b>Beim Verarbeiten der Daten ist ein Fehler aufgetreten. Bitte schließen Sie das Fenster und versuchen Sie es erneut</b>'),
            EMAIL_ADRESS: createAlert(ALERTS_TYPES.DANGER, '<b>Geben sie eine gültige E-Mail-Adresse an</b>'),
            NOTIFICATION_REPEAT: createAlert(ALERTS_TYPES.INFO, `<b>Sie haben bereits eine Benachrichtigung vorbereitet</b>`),
            SUCCESS: createAlert(ALERTS_TYPES.SUCCESS, '<b>Die Benachrichtigung wurde erfolgreich erstellt</b>.<br>Sobald die Benachrichtigung gesendet wurde, wird Ihre E-Mail aus unserer Datenbank gelöscht.')
        },
        EMAIL: {
            SUBJECT_MOVIE: 'Ihr Film ist jetzt verfügbar!',
            SUBJECT_TV: 'Ihre Serie ist jetzt verfügbar!',
            TEXT_MOVIE_BEFORE: 'Der Film',
            TEXT_TV_BEFORE: 'Die TV-Show',
            TEXT_AFTER: 'ist ab sofort erhältlich unter:'
        }
    },
    en: {
        NOTIFICATION: {
            UNEXPECTED_ERROR: createAlert(ALERTS_TYPES.DANGER, '<b>There was an error processing the data. Please close the window and try again</b>'),
            EMAIL_ADRESS: createAlert(ALERTS_TYPES.DANGER, '<b>Insert a valid email</b>'),
            NOTIFICATION_REPEAT: createAlert(ALERTS_TYPES.INFO, `<b>You already have a notification prepared</b>`),
            SUCCESS: createAlert(ALERTS_TYPES.SUCCESS, '<b>The notification has been created successfully</b>.<br>Once the notification is sent, your email will be deleted from our database.')
        },
        EMAIL: {
            SUBJECT_MOVIE: 'Your movie is now available!',
            SUBJECT_TV: 'Your series is now available!',
            TEXT_MOVIE_BEFORE: 'The movie',
            TEXT_TV_BEFORE: 'The TV show',
            TEXT_AFTER: 'is now available at:'
        }
    }
}


const REGEX_EMAIL = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

router.post('/', async (req, res) => {
    var email = req.body.email.trim()
    var type = req.body.type.trim()
    var id = req.body.id.trim()
    var language = req.body.language.trim()
    if (!isNaN(language) || language.length != 2) {
        return res.send(ENUM_ALERTS[language].NOTIFICATION.UNEXPECTED_ERROR)
    }
    if (type != 'movie' && type != 'tv') {
        return res.send(ENUM_ALERTS[language].NOTIFICATION.UNEXPECTED_ERROR)
    }
    if (isNaN(id)) {
        return res.send(ENUM_ALERTS[language].NOTIFICATION.UNEXPECTED_ERROR)
    }
    if (!REGEX_EMAIL.test(email) || email == process.env.EMAIL_ADRESS) {
        return res.send(ENUM_ALERTS[language].NOTIFICATION.EMAIL_ADRESS)
    }
    var notificationDB = await notificationModel.findOne({
        email: email,
        mediaID: id,
        mediaType: type
    })
    if (notificationDB) {
        return res.send(ENUM_ALERTS[language].NOTIFICATION.NOTIFICATION_REPEAT)
    }
    var now = new Date()
    now.setSeconds(0)
    now.setMinutes(0)
    now.setMilliseconds(0)
    var notification = await notificationModel.create({
        email: email,
        mediaID: id,
        mediaType: type,
        language: language,
        createdAt: now
    })
    await notification.save()
    res.send(ENUM_ALERTS[language].NOTIFICATION.SUCCESS)
    prepareNotification(notification)
})

global.prepareNotifications = async function () {
    var notifications = await notificationModel.find({})
    for (let notification of notifications) {
        prepareNotification(notification)
    }
}


async function prepareNotification(notification) {
    if (notification.mediaType == 'movie') {
        var watchProviders = (await moviedb.movieWatchProviders(notification.mediaID)).results
        if (!watchProviders[(notification.language == 'en' ? 'us' : notification.language).toUpperCase()]) {
            return delayNotification(notification)
        }
        var flatrate = watchProviders[(notification.language == 'en' ? 'us' : notification.language).toUpperCase()].flatrate
        var movie = await moviedb.movieInfo({ id: notification.mediaID, language: notification.language })
        var text = `${ENUM_ALERTS[notification.language].EMAIL.TEXT_MOVIE_BEFORE} '${movie.title}' ${ENUM_ALERTS[notification.language].EMAIL.TEXT_AFTER} `
        if (flatrate && flatrate.length >= 1) {
            for (let provider of flatrate) {
                text += `${provider.provider_name}, `
            }
            text = text.substring(0, text.length - 2) + "."
            sendEmail(notification.email, ENUM_ALERTS[notification.language].EMAIL.SUBJECT_MOVIE, text)
            await notificationModel.findOneAndDelete({
                email: notification.email,
                language: notification.language,
                mediaID: notification.mediaID,
                mediaType: notification.mediaType,
                createdAt: notification.createdAt
            })
        }
        else {
            return delayNotification(notification)
        }
    } else if (notification.mediaType == 'tv') {
        var watchProviders = (await moviedb.tvWatchProviders(notification.mediaID)).results
        if (!watchProviders[(notification.language == 'en' ? 'us' : notification.language).toUpperCase()]) {
            return delayNotification(notification)
        }
        var flatrate = watchProviders[(notification.language == 'en' ? 'us' : notification.language).toUpperCase()].flatrate
        var tv = await moviedb.tvInfo({ id: notification.mediaID, language: notification.language })
        var text = `${ENUM_ALERTS[notification.language].EMAIL.TEXT_TV_BEFORE} '${tv.name}' ${ENUM_ALERTS[notification.language].EMAIL.TEXT_AFTER} `
        if (flatrate && flatrate.length >= 1) {
            for (let provider of flatrate) {
                text += `${provider.provider_name}, `
            }
            text = text.substring(0, text.length - 2)
            sendEmail(notification.email, ENUM_ALERTS[notification.language].EMAIL.SUBJECT_TV, text)
            await notificationModel.findOneAndDelete({
                email: notification.email,
                language: notification.language,
                mediaID: notification.mediaID,
                mediaType: notification.mediaType,
                createdAt: notification.createdAt
            })
        }
        else {
            return delayNotification(notification)
        }
    }
}

function delayNotification(notification) {
    var now = new Date()
    var dateLater = new Date()
    // 1 2 3 4 6 8 12 24
    const hour = 6
    if (now.getHours() % hour == 0) {
        dateLater.setHours(dateLater.getHours() + hour)
    } else {
        dateLater.setHours(hour * (Math.ceil(dateLater.getHours() / hour)))
    }
    dateLater.setMinutes(0)
    dateLater.setSeconds(0)
    dateLater.setMilliseconds(0)
    var diff = dateLater - (new Date())
    setTimeout((notification) => {
        prepareNotification(notification)
    }, diff, notification);
}


function createAlert(type, message) {
    var dibujo = ""
    type = type == "info" ? "primary" : type
    switch (type) {
        case 'success':
            dibujo = "#check-circle-fill"
            break;
        case 'primary':
            dibujo = "#info-fill"
            break;
        case 'warning':
            dibujo = "#exclamation-triangle-fill"
            break;
        case 'danger':
            dibujo = "#exclamation-triangle-fill"
            break;
    }
    return `<div class="alert alert-dismissible alert-${type} d-flex align-items-center" role="alert">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="${dibujo}"/></svg>
    <div style="text-align:left;">
     ${message}
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`
}

/**
 * 
 * @param {string} email 
 * @param {string} subject 
 * @param {string} text 
 */
function sendEmail(email, subject, text) {
    var transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_ADRESS,
            pass: process.env.EMAIL_PASS
        }
    });

    var mailOptions = {
        from: `Movie Hunter 🎬 <${process.env.EMAIL_ADRESS}>`,
        to: email,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = router