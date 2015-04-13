var app = angular.module('calendar', ['ngRoute'])

app.config(function($routeProvider){
  // Every url goes to calendar.html template
  $routeProvider.when('/insert', {
    templateUrl: 'insert.html',
    controller: 'insertController'
  })
  $routeProvider.otherwise({
    templateUrl: 'calendar.html',
    controller: 'calendarController'
  })
})

app.controller('calendarController', function($scope){
  // GET all the events
  $.get("events",function(items){
    // Convert them to GUI format
    ev = items.map(function(item){
      return {
        id: item.id,
        title: item.description,
        start: moment(item.startDate).valueOf(),
        end: moment(item.endDate).valueOf()
      }
    })

    // Create calendar with given events
    $scope.calendar = $("#calendar").calendar({
      tmpl_path: "bower_components/bootstrap-calendar/tmpls/",
      events_source: ev 
    })
  })
})

app.controller('insertController', function($scope){
  $scope.insert = function(desc,sd,ed){
    var obj = { description: desc, startDate: sd, endDate: ed }
    $.post("events", obj, function(data){
      if(data.affectedRows === 1){
        console.log('ok')
      } else {
        console.log(data)
      }
    })
  }
})
