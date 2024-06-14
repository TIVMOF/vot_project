angular.module('myApp').factory('Auth', ['$q', function($q) {
    var auth = {};
    var keycloak = new Keycloak('keycloak.json');

    auth.init = function() {
        var deferred = $q.defer();

        keycloak.init({ onLoad: 'login-required' }).success(function() {
            deferred.resolve();
        }).error(function() {
            deferred.reject();
        });

        auth.keycloak = keycloak;
        return deferred.promise;
    };

    return auth;
}]);