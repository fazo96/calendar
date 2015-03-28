function fromAPItoGUI(list){
  console.log(list)
  var ret = []
  list.forEach(function(item){
    console.log(item)
    var i = { id: item.id, title: item.description }
    i.start = moment(item.startDate).valueOf()
    i.end = moment(item.endDate).valueOf()
    console.log(moment(i.start).format())
    ret.push(i)
  })
  console.log(ret)
  return ret
}

var calendar
var ev = []
$.get("events",function(items){
  ev = fromAPItoGUI(items);
  $("#calendar").calendar({
    tmpl_path: "/tmpls/",
    events_source: ev 
  })
  console.log($("#calendar"))
})
