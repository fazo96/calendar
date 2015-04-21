var app = angular.module('calendar', ['ngRoute'])

app.config(function($routeProvider){
  // Every url goes to calendar.html template
  $routeProvider.when('/insert', {
    templateUrl: 'insert.html',
    controller: 'insertController'
  })
  $routeProvider.when('/evt/:id', {
    templateUrl: 'evt.html',
    controller: 'evtController'
  })
  $routeProvider.otherwise({
    templateUrl: 'calendar.html',
    controller: 'calendarController'
  })
})

app.controller('calendarController', function($scope,$http){
  // GET all the events
  $http.get("/events").success(function(items){
    // Convert them to GUI format
    ev = items.map(function(item){
      return {
        id: item.id,
        title: item.description,
        url: '#/evt/'+item.id,
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
  $scope.desc = ""
  var opt = {
    format: 'YYYY-MM-DD HH:mm',
    inline: true, sideBySide: true
  }
  $('.datetime').datetimepicker(opt);
  $('#start').on("dp.change", function (e) {
    $('#end').data("DateTimePicker").minDate(e.date);
  });
  $('#end').on("dp.change", function (e) {
    $('#start').data("DateTimePicker").maxDate(e.date);
  });
  $scope.insert = function(){
    var sd = $('#start').data("DateTimePicker").date().format('YYYY-MM-DD hh:mm:ss')
    var ed = $('#end').data("DateTimePicker").date().format('YYYY-MM-DD hh:mm:ss')
    var obj = { description: $scope.desc, startDate: sd, endDate: ed }
    console.log(JSON.stringify(obj))
    $http.post('/events',JSON.stringify(obj)).success(function(){
      console.log('posted')
    })
  }
})

app.controller('evtController', function($scope,$routeParams,$http){
  $http.get('/events/'+$routeParams.id).success(function(data){
    console.log(data[0])
    $scope.data = data[0] 
  })
})
