const admin = require('./cloud-messaging.config');

exports.sendCloudMessage = (app) => app.post('/cloudMessaging/sendCloudMessage', (req, res, next) => {
    const registrationTokens = req.body.registrationTokens;
    if (!req.body.message)
        return res.status(400).send({ message: 'A message object is required.' });

    const title = req.body.message.title;
    const body = req.body.message.body;
    if (!registrationTokens) {
        return res.status(400).send({ message: 'Field registrationTokens is required.' });
    }

    else if (!title) {
        return res.status(400).send({ message: 'Field message title is required.' });
    }

    else if (!body) {
        return res.status(400).send({ message: 'Field message body is required.' });
    }

    const jobId = req.body.jobId;
    const message = jobId ? {
        notification: {
            title: title,
            body: body,
            jobId: jobId,
        }
    } : {
        notification: {
            title: title,
            body: body,
        }
    };

    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24,
    }

    admin.messaging().sendToDevice(registrationTokens, message, options)
        .then(response => {
            return res.status(200).send({ res: response })
        })
        .then(res => next())
        .catch(error => {
            console.log(error);
            return res.status(500).send({ message: error.message });
        });
});

exports.sendToAll = (app) => app.post('/cloudMessaging/sendToAll', (req, res, next) => {
    const title = req.body.message.title;
    const body = req.body.message.body;

    if (!req.body.message)
        return res.status(400).send({ message: 'A message object is required.' });

    if (!title) {
        return res.status(400).send({ message: 'Field message title is required.' });
    }

    else if (!body) {
        return res.status(400).send({ message: 'Field message body is required.' });
    }

    const message = {
        topic: "job",
        notification: {
            title: title,
            body: body,
        }
    }
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24,
    }

    admin.messaging().send(message)
        .then(response => {
            return res.status(200).send({ res: response })
        })
        .then(res => next())
        .catch(error => {
            console.log(error);
            return res.status(500).send({ message: error.message });
        });
});