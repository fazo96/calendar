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
  $routeProvider.when('/:view?',{
    templateUrl: '/calendar.html',
    controller: 'calendarController'
  })
  $routeProvider.when('/tags',{
    templateUrl: '/tags.html',
    controller: 'tagController'
  })
  $routeProvider.otherwise({
    redirectTo: '/'
  })
})

app.controller('calendarController', function($scope,$http,$routeParams){
  $scope.loaded = false
  if(['month','day','week','year'].indexOf($routeParams.view) >= 0)
    $scope.calendar.view($routeParams.view)
  // GET all the events
  $http.get("/events").success(function(items){
    // Convert them to GUI format
    ev = items.map(function(item){
      return {
        id: item.id,
        title: item.title,
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
        $('.cal-ui').removeClass('active') 
        $('.'+view).addClass('active') 
        $('#cal-title').text(this.getTitle())
      }
    })
    console.log($scope.calendar)
    $scope.loaded = true
  }).error(function(data,status){
    swal('Error Code '+status, data, 'error')
  })
})

app.controller('tagController',function($scope){})

function initDatetimepickers(start,end){
  var opt = {
    format: 'YYYY-MM-DD HH:mm',
    inline: true, sideBySide: true
  }
  $('.datetime').datetimepicker(opt);
  if(start) $('#start').data("DateTimePicker").date(start)
  if(end) $('#end').data("DateTimePicker").date(end)
  $('#start').on("dp.change", function (e) {
    $('#end').data("DateTimePicker").minDate(e.date);
  });
  $('#end').on("dp.change", function (e) {
    $('#start').data("DateTimePicker").maxDate(e.date);
  });
}

function readDatetimepickers(){
  return {
    start: $('#start').data("DateTimePicker").date().format('YYYY-MM-DD HH:mm')+":00",
    end: $('#end').data("DateTimePicker").date().format('YYYY-MM-DD HH:mm')+":00"
  }
}

app.controller('insertController', function($scope,$http,$location){
  $scope.title = ""
  initDatetimepickers()
  $scope.insert = function(){
    var o = readDatetimepickers()
    console.log(o.start,o.end)
    var obj = { title: $scope.title, startDate: o.start, endDate: o.end }
    console.log(JSON.stringify(obj))
    $http.post('/events',JSON.stringify(obj)).success(function(data){
      swal('Ok', 'event succesfully posted', 'success')
      $location.url('/evt/'+data.insertId)
    })
  }
})

app.controller('evtController', function($scope,$routeParams,$http,$location){
  $scope.editing = false
  $scope.title = ""
  $scope.reload = function(){
    $scope.canEdit = false
    $scope.dataLoaded = false
    $http.get('/events/'+$routeParams.id).success(function(data){
      $scope.dataLoaded = true
      if(data.length == 0) // not found
        return swal({
          title: "Event Not Found",
          text: "This event has been deleted or never existed",
          type: "error", 
        }, function(){ $location.url('/') })
      $scope.data = data[0] 
      $scope.startDateFN = moment(data[0].startDate).fromNow()
      $scope.endDateFN = moment(data[0].endDate).fromNow()
      $scope.startDate = moment(data[0].startDate).format("dddd D MMMM YYYY HH:mm:ss")
      $scope.endDate = moment(data[0].endDate).format("dddd D MMMM YYYY HH:mm:ss")
      initDatetimepickers(moment(data[0].startDate),moment(data[0].endDate))
      $scope.canEdit = true
    }).error(function(data,status){
      swal('Error Code '+status, data, 'error')
    })
  }
  $scope.reload()
  $scope.edit = function(){
    function reallyEdit(){
      var o = readDatetimepickers()
      var obj = {title: $scope.title, startDate: o.start, endDate: o.end}
      $http.put('/events/'+$routeParams.id,obj).success(function(data){
        console.log(data)
        swal('Saved','the event has been overwritten', 'success')
        $scope.reload()
      }) 
      $scope.canEdit = false
      $scope.$apply()
    }
    swal({
      title: "Are you sure?",
      text: "The event will be overwritten",
      type: "warning", 
      showCancelButton: true,
      confirmButtonText: "Yes",
      closeOnConfirm: true
    }, reallyEdit)
  }
  $scope.delete = function(){
    function reallyDelete(){
      $scope.canEdit = false
      $scope.$apply()
      $http.delete('/events/'+$routeParams.id).success(function(data){
        swal('Done!','the event has been deleted', 'success')
        $location.url('/')
      }).error(function(data,status){
        $scope.canEdit = false
        swal('Error Code '+status, data, 'error')
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
