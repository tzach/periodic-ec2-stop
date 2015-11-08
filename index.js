'use strict';

var AWS = require('aws-sdk');
var pify = require('pify');
var Promise = require('pinkie-promise');

var ec2 = new AWS.EC2();

// Find a tag in an array of tags
function myIndexOfTag(arr, o) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].Key == o.Key && arr[i].Value == o.Value) {
            return i;
        }
    }
    return -1;
}

exports.handler = function (event, context) {
  console.log('exports.handler');
  var describeParams = {
    Filters: [ { Name: "instance-state-name", Values: ["running"]} ]
  };

  // Describe the instances
  pify(ec2.describeInstances.bind(ec2), Promise)(describeParams).then(function (data) {

    var stopParams = {
      InstanceIds: []
    };

    var now = new Date();

    data.Reservations.forEach(function (reservation) {
      reservation.Instances.forEach(function (instance) {
        var launch_time = Date.parse(instance.LaunchTime);
        var runningTime = (now - launch_time) / 1000 / 3600;
        console.log('instanseId:', instance.InstanceId, ' runningTime in hours:', runningTime, ' tags:', instance.Tags);

        var pos = myIndexOfTag(instance.Tags, { Key: 'keep', Value: 'alive' });
        if ((runningTime > 12) && (pos == -1)) { // time is over 12 hours and there is no keep:alive tag
          stopParams.InstanceIds.push(instance.InstanceId);
        }
      });
    });
    if (stopParams.InstanceIds.length > 0) {
      // Stop the instances
      console.log('just killed:', stopParams);
      return pify(ec2.stopInstances.bind(ec2), Promise)(stopParams);
    }
  }).then(context.succeed)
    .catch(context.fail);
}
