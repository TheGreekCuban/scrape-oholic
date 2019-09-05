$(document).ready(function() {

  $.ajax({
    type: "GET",
    url: "/articles",
  }).then(data => {
    console.log(data)
  })
})