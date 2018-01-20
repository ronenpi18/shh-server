module.exports = {

    'facebookAuth': {
        'clientID': '949445881886037', // your App ID
        'clientSecret': 'd912063c296de1c8950ed20b7f444160', // your App Secret
        'callbackURL': 'http://localhost:8081/auth/facebook/callback',
        'profileFields': ['email', 'id', 'first_name', 'gender', 'last_name', 'picture']
    }
};