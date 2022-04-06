const request = require('request');

const apiOptions = {
    server : "http://localhost:3000"
};

const showError = (res, status) => {
    let title = '';
    let content = '';
    if (status === 404) { 
        title = "404, page not found";
        content = "Oh dear. Looks as if we can't find this page. Sorry.";
    } else  {
        title = status + ", something's gone wrong";
        content = "Something, somewhere, has gone just a little bit wrong.";
    }
    res.status(status);
    res.render('generic-text', {
        title : title,
        content : content
    });
};

const renderHomePage = (res, responseBody) => {
    let message = null;
    if (!responseBody.length) {
        message = "No places found nearby";
    }
    res.render('locations-list', {
        title: 'Loc8r - find a place to work with wifi',
        pageHeader: {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
        locations: responseBody,
        message : message
    });
};

const renderDetailPage = (res, responseBody) => {
    res.render('location-info', {
        title: 'Location Info',
        pageHeader: {title: responseBody.name},
        sidebar: {
            context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location: responseBody
    });
};

const renderReviewForm = (res, responseBody) => {  
    res.render('location-review-form', {
        title: 'Review ' + responseBody.name + ' on Loc8r',
        pageHeader: {
            title: 'Review ' + responseBody.name
        }});
    };

/* GET 'home' page */
const homelist = (req, res) => {
//    const path = '/api/locations' ;
    const requestOption = {
        url : "http://localhost:3000/api/locations",
        method : 'GET',
        json : {}
    };   
    request(requestOption, (err, response, body) =>{
        if (response.statusCode === 200) {
            renderHomePage(res, body);
        }else {
            showError(res, response.statusCode);
        }
    });
};

/* GET 'Location info' page */
const locationInfo = (req, res) => {
    const path = '/api/locations/' + req.params.locationid;
    const requestOption = {
        url : apiOptions.server + path,
        method : 'GET',
        json : {}
    };
    request(requestOption, (err, response, body) => { 
        if (response.statusCode === 200) {
            let data = body;
            data.coords = {
                lng : body.coords[0],
                lat : body.coords[1]
            };
            renderDetailPage(res, data);
        }
        else {
            showError(res, response.statusCode);
        }
    });
};

/* GET 'Add review' page */
const addReview = (req, res) => {
    const path = '/api/locations/' + req.params.locationid;
    const requestOption = {
        url : apiOptions.server + path,
        method : 'GET',
        json : {}
    };
    request(requestOption, (err, response, body) => { 
        if (response.statusCode === 200) {
            renderReviewForm(res, body);
        } else {
            showError(response.statusCode);
        }
    });
};

const doAddReview = (req, res) => {
    const locationid = req.params.locationid;
    const postData = {
        author : req.body.name,
        rating : req.body.rating,
        reviewText: req.body.review
    };

    const path = '/api/locations/' + locationid + '/reviews';
    const requestOption = {
        url : apiOptions.server + path,
        method : 'POST',
        json : postData
    };

    request(requestOption, (err, response, body) => {
        if (response.statusCode === 201) {
            res.redirect('/location/' + locationid);
        } else {
            showError(res, response.statusCode);
        }
    });
};

module.exports = {
    homelist,
    locationInfo,
    addReview,
    doAddReview
};