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
 
  //Adding a post request in order to update the saved value in each article object...
  $(".saveButton").click(function() {
    let id = $(this).attr("id")
  
    return $.ajax({
      type: "POST",
      url: "/saved/" + id,
      id: id,
      data: {
        saved: true
      }
    }).then($(this).closest(".card").remove())
  })
})

//Adding a function to remove the card after it is saved.
const removeCard = () => {
  $(this).closest(".card").remove()
}
