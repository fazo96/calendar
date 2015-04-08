function fromAPItoGUI(list){
  var ret = []
  list.forEach(function(item){
    var i = { id: item.id, title: item.description }
    i.start = moment(item.startDate).valueOf()
    i.end = moment(item.endDate).valueOf()
    ret.push(i)
  })
  return ret
}

var calendar
var ev = []
$.get("events",function(items){
  ev = fromAPItoGUI(items);
  calendar = $("#calendar").calendar({
    tmpl_path: "bower_components/bootstrap-calendar/tmpls/",
    events_source: ev 
  })
})

$('#go-prev').click(function(){ calendar.navigate('prev') });
$('#go-next').click(function(){ calendar.navigate('next') });
$('#go-today').click(function(){ calendar.navigate('today') });
$('#view-year').click(function(){ calendar.view('year') });
$('#view-month').click(function(){ calendar.view('month') });
$('#view-week').click(function(){ calendar.view('week') });
$('#view-day').click(function(){ calendar.view('day') });
