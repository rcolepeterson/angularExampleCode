'use strict';

angular.module('challengeApp')
    .controller('MainCtrl', function($scope, $http, myService) {

        myService.then(function(users) {
            $scope.users = users;
        });

    }).factory('myService', function($q, serviceA, serviceB) {

        var fn = function(res) {
            return res.data;
        };

        var promises = [
            serviceA.GetAsyncStuff().then(fn),
            serviceB.GetAsyncStuff().then(fn)
        ];

        return $q.all(promises).then(function(results) {
            var users = results[0],
                logs = results[1],
                posts = logs,
                i = 0,
                len = users.length,
                currentUserID,
                filtered,
                user,
                fDate;

            for (i, len; i < len; i++) {
                user = users[i];
                user.revenue = 0;
                user.impressions = 0;
                user.conversions = 0;
                currentUserID = user.id;
                user.data = [0, 0, 0, 0, 0, 0, 0];

                filtered = posts.filter(function(element) {
                    return element.user_id === currentUserID;
                });

                filtered.forEach(function(element, index, array) {
                    if (element.type === 'impression') {
                        user.impressions++;
                    }
                    if (element.type === 'conversion') {
                        user.conversions++;
                        user.revenue += Math.ceil(element.revenue);
                        fDate = new Date(element.time.substring(0, 10));
                        user.endDate = user.endDate > fDate ? user.endDate : fDate;
                        user.startDate = user.startDate < fDate ? user.startDate : fDate;
                        user.data[fDate.getDay()] += user.revenue;
                    }

                });
            }
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
            if (input !== null)
                return input.substring(0, 1).toUpperCase();
        };
    }).directive('imgError', function() {
        return {
            restrict: 'A',
            link: function(scope, element) {
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
            link: function(scope, element, $compile) {
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
