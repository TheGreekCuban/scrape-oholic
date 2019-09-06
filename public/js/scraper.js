$(document).ready(function () {

  //Adding click handler for scraperLink - this will call the API for the data.
  $(".scraperLink").click(function () {
    return $.ajax({
      type: "GET",
      url: "/scrape",
    }).then(function(data) {
      console.log("COUNT: ", data)
    })
  })
})
