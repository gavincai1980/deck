'use strict';

angular.module('deckApp')
  .controller('ScalingActivitiesCtrl', function($scope, $modalInstance, applicationName, account, clusterName, serverGroup, serverGroupService) {
    var ctrl = this;
    serverGroupService.getScalingActivities(applicationName, account, clusterName, serverGroup.name, serverGroup.region).then(function(response) {
      $scope.activities = ctrl.groupScalingActivities(response);
    });

    this.groupScalingActivities = function(activities) {
      var grouped = _.groupBy(activities, 'cause'),
        results = [];
      _.forOwn(grouped, function(group) {
        if (group.length) {
          var events = [];
          group.forEach(function(entry) {
            var availabilityZone = 'unknown';
            try {
              availabilityZone = JSON.parse(entry.details)['Availability Zone'] || availabilityZone;
            } catch (e) {
              // I don't imagine this would happen but let's not blow up the world if it does.
            }
            events.push({description: entry.description, availabilityZone: availabilityZone});
          });
          results.push({
            cause: group[0].cause,
            events: events,
            startTime: group[0].startTime,
            statusCode: group[0].statusCode
          });
        }
      });
      return _.sortBy(results, 'startTime').reverse();
    };

    $scope.serverGroup = serverGroup;

    this.isSuccessful = function(activity) {
      return activity.statusCode === 'Successful';
    };
    $scope.close = $modalInstance.dismiss;
  });
