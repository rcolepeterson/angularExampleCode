'use strict';

angular.module('myCoolApplication')
    .controller('MainCtrl', function($scope, $http, myService) {

        //$q example
        myService.then(function(users) {
            $scope.users = users;
        });

    }).factory('myService', function($q, serviceA, serviceB) {

        //combinine multiple promises into a single promise that is resolved when all of the input promises are resolved.

        var fn = function(res) {
            return res.data;
        };

        var promises = [
            serviceA.GetAsyncStuff().then(fn),
            serviceB.GetAsyncStuff().then(fn)
        ];

        return $q.all(promises).then(function(results) {

            var users = results[0],
                logs = results[1];

            //you can manipulate consolidated data here

            return users;
        });
    }).factory('serviceA', function($http) {
        return {
            GetAsyncStuff: function() {
                return $http.get('scripts/api/users.json');
            }
        };
    }).factory('serviceB', function($http) {
        return {
            GetAsyncStuff: function() {
                return $http.get('scripts/api/logs.json');
            }
        };
    }).filter('firstLetter', function() {
        return function(input) {

            //example of a filter

            if (input !== null) {
                return input.substring(0, 1).toUpperCase();
            }
        };
    }).directive('imgError', function() {
        return {
            restrict: 'A',
            link: function(scope, element) {

                //display blank image if error occurs .... directive.

                element.bind('error', function() {
                    $(this).attr('src', 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
                    $(this).unbind('error', this);
                });
            }
        };
    }).directive('chart', function() {
        return {
            restrict: 'E',
            template: '<canvas class="myChart" width="160" height="130"></canvas>',
            scope: {
                data: '@'
            },
            link: function(scope, element) {

                //directive for chart js.

                var chartOptions = {
                    animation: false,
                    scaleShowLabels: false,
                    scaleShowGridLines: false,
                    scaleGridLineColor: 'rgba(0,0,0,0)',
                    scaleLineColor: 'rgba(0,0,0,0)',
                    bezierCurve: false,
                    pointDot: false
                };

                var lineData = {
                    labels: ['', '', '', '', '', '', ''],
                    datasets: [{
                        fillColor: 'rgba(0,0,0,0)',
                        strokeColor: 'rgba(0,0,0,1)',
                        data: JSON.parse(scope.data)
                    }]
                };
                var canvas = element.find('canvas');
                var ctx = $(canvas).get(0).getContext('2d');
                new Chart(ctx).Line(lineData, chartOptions);
            }
        };
    });
