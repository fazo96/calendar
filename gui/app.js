var app = angular.module('calendar', ['ngRoute'])

app.config(function($routeProvider,$locationProvider){
  $locationProvider.html5Mode({enabled: true, requireBase: false})
  // Every url goes to calendar.html template
  $routeProvider.when('/insert', {
    templateUrl: '/insert.html',
    controller: 'insertController'
  })
  $routeProvider.when('/evt/:id', {
    templateUrl: '/evt.html',
    controller: 'evtController'
  })
  $routeProvider.otherwise({
    templateUrl: '/calendar.html',
    controller: 'calendarController'
  })
})

app.controller('calendarController', function($scope,$http){
  $scope.loaded = false
  // GET all the events
  $http.get("/events").success(function(items){
    // Convert them to GUI format
    ev = items.map(function(item){
      return {
        id: item.id,
        title: item.description,
        url: '/evt/'+item.id,
        start: moment(item.startDate).valueOf(),
        end: moment(item.endDate).valueOf()
      }
    })

    // Create calendar with given events
    $scope.calendar = $("#calendar").calendar({
      tmpl_path: "bower_components/bootstrap-calendar/tmpls/",
      events_source: ev,
      onAfterViewLoad: function(view){
        console.log(this)
        $('#cal-title').text(this.getTitle())
      }
    })
    $scope.loaded = true
  }).error(function(data,status){
    swal('Error '+status, data, 'error')
  })
})

app.controller('insertController', function($scope,$http,$location){
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
    var sd = $('#start').data("DateTimePicker").date().format('YYYY-MM-DD HH:mm')+":00"
    var ed = $('#end').data("DateTimePicker").date().format('YYYY-MM-DD HH:mm')+":00"
    console.log(sd,ed)
    var obj = { description: $scope.desc, startDate: sd, endDate: ed }
    console.log(JSON.stringify(obj))
    $http.post('/events',JSON.stringify(obj)).success(function(data){
      swal('Ok', 'event succesfully posted', 'success')
      $location.url('/evt/'+data.insertId)
    })
  }
})

app.controller('evtController', function($scope,$routeParams,$http,$location){
  $scope.canDelete = false
  $scope.dataLoaded = false
  $http.get('/events/'+$routeParams.id).success(function(data){
    $scope.dataLoaded = true
    console.log(data[0])
    $scope.data = data[0] 
    $scope.startDateFN = moment(data[0].startDate).fromNow()
    $scope.endDateFN = moment(data[0].endDate).fromNow()
    $scope.startDate = moment(data[0].startDate).format("dddd D MMMM YYYY HH:mm:ss")
    $scope.endDate = moment(data[0].endDate).format("dddd D MMMM YYYY HH:mm:ss")
    $scope.canDelete = true
  }).error(function(data,status){
    swal('Error '+status, data, 'error')
  })
  $scope.delete = function(){
    function reallyDelete(){
      $scope.canDelete = false
      $scope.$apply()
      $http.delete('/events/'+$routeParams.id).success(function(data){
        swal('Done!','the event has been deleted', 'success')
        $location.url('/')
      }).error(function(data,status){
        $scope.canDelete = false
        swal('Error '+status, data, 'error')
      })
    }
    swal({
      title: "Are you sure?",
      text: "The event will be lost forever",
      type: "warning", 
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      closeOnConfirm: true
    }, reallyDelete)
  }
})
